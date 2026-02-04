// src/lib/services/textToDialogueService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";
import { Types } from "mongoose";

import { connectToDB } from "@/lib/mongodb";
import { capturePosthogServerEvent } from "@/lib/posthogClient";
import {
  deleteBackblazeFile,
  uploadDialogueToBackblaze,
  downloadBackblazeFile,
} from "@/lib/services/backblazeService";
import { DialogueGeneration } from "@/models/DialogueGeneration";
import { User } from "@/models/User";
import { PLANS, TEXT_TO_DIALOGUE_CONFIG } from "@/constants";
import { TextToDialogueRequest, DialogueInput } from "@/types/TextToDialogueRequest";
import { TextToDialogueResponse } from "@/types/TextToDialogueResponse";

/**
 * Estimate audio duration from characters (rough estimate: 150 WPM, 5 chars per word)
 */
function estimateDurationFromChars(totalChars: number): number {
  const wordsPerMinute = 150;
  const charsPerWord = 5;
  const words = totalChars / charsPerWord;
  const minutes = words / wordsPerMinute;
  return minutes * 60; // seconds
}

export const generateDialogue = async (
  payload: TextToDialogueRequest
): Promise<TextToDialogueResponse> => {
  const { userId, inputs, title = "Untitled dialogue" } = payload;

  try {
    // 1) Validate inputs
    if (!inputs || inputs.length === 0) {
      throw new Error("At least one dialogue input is required");
    }

    if (inputs.length > TEXT_TO_DIALOGUE_CONFIG.maxLines) {
      throw new Error(
        `Maximum ${TEXT_TO_DIALOGUE_CONFIG.maxLines} dialogue lines allowed`
      );
    }

    let totalChars = 0;
    for (const input of inputs) {
      if (!input.text || input.text.trim().length === 0) {
        throw new Error("Each dialogue line must have text");
      }
      if (!input.voiceId) {
        throw new Error("Each dialogue line must have a voice ID");
      }
      if (input.text.length > TEXT_TO_DIALOGUE_CONFIG.maxCharsPerLine) {
        throw new Error(
          `Each line must be under ${TEXT_TO_DIALOGUE_CONFIG.maxCharsPerLine} characters`
        );
      }
      totalChars += input.text.length;
    }

    if (totalChars > TEXT_TO_DIALOGUE_CONFIG.maxTotalChars) {
      throw new Error(
        `Total characters (${totalChars}) exceeds maximum of ${TEXT_TO_DIALOGUE_CONFIG.maxTotalChars}`
      );
    }

    const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
    if (!elevenLabsKey) {
      throw new Error("Missing ELEVENLABS_API_KEY environment variable");
    }

    // 2) Ensure DB connection
    await connectToDB();

    // 3) Fetch user from DB
    const user = await User.findOne({ clerkId: userId });
    if (!user) {
      throw new Error("User not found");
    }

    // 4) Check usage limits
    const plan = user.plan as keyof typeof PLANS;
    const limits = PLANS[plan];
    const nextGenerationCount = (user.usage.dialogueGenerationsUsed || 0) + 1;
    const nextCharCount = (user.usage.dialogueCharactersUsed || 0) + totalChars;

    if (nextGenerationCount > limits.maxDialogueGenerations) {
      capturePosthogServerEvent({
        distinctId: userId,
        event: "usage_limit_hit",
        properties: {
          feature: "text-to-dialogue",
          userId,
          plan: user.plan,
          limitType: "dialogue_generations",
          attempted: nextGenerationCount,
          limit: limits.maxDialogueGenerations,
        },
      });

      throw new Error("User has exceeded dialogue generation limit for their plan");
    }

    if (nextCharCount > limits.maxDialogueCharacters) {
      capturePosthogServerEvent({
        distinctId: userId,
        event: "usage_limit_hit",
        properties: {
          feature: "text-to-dialogue",
          userId,
          plan: user.plan,
          limitType: "dialogue_characters",
          attempted: nextCharCount,
          limit: limits.maxDialogueCharacters,
        },
      });

      throw new Error("User has exceeded dialogue character limit for their plan");
    }

    // 5) Call ElevenLabs Text to Dialogue API
    const apiInputs = inputs.map((input) => ({
      text: input.text,
      voice_id: input.voiceId,
    }));

    const response = await fetch(
      "https://api.elevenlabs.io/v1/text-to-dialogue",
      {
        method: "POST",
        headers: {
          "xi-api-key": elevenLabsKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: apiInputs }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    // 6) Get the audio as buffer
    const audioArrayBuffer = await response.arrayBuffer();
    const audioBuffer = Buffer.from(audioArrayBuffer);

    // 7) Estimate duration
    const duration = estimateDurationFromChars(totalChars);

    // 8) Allocate dialogue id up-front
    const dialogueObjectId = new Types.ObjectId();
    const dialogueId = dialogueObjectId.toHexString();

    // 9) Upload to Backblaze B2
    const upload = await uploadDialogueToBackblaze({
      userId,
      dialogueId,
      audioBuffer,
      extension: "mp3",
      contentType: "audio/mpeg",
    });

    // 10) Persist DB state
    try {
      await DialogueGeneration.create({
        _id: dialogueObjectId,
        userId: user._id,
        title,
        inputs: inputs.map((i) => ({
          text: i.text,
          voiceId: i.voiceId,
          voiceName: i.voiceName,
        })),
        audioPath: upload.fileName,
        audioFileId: upload.fileId,
        duration,
        totalCharacters: totalChars,
      });
    } catch (dbError) {
      try {
        await deleteBackblazeFile({
          fileName: upload.fileName,
          fileId: upload.fileId,
        });
      } catch (cleanupError) {
        throw new Error(
          "Failed to persist dialogue generation after uploading (and cleanup also failed)",
          {
            cause: { dbError, cleanupError },
          }
        );
      }

      throw new Error("Failed to persist dialogue generation", { cause: dbError });
    }

    // 11) Update user usage
    try {
      user.usage.dialogueGenerationsUsed = nextGenerationCount;
      user.usage.dialogueCharactersUsed = nextCharCount;
      await user.save();
    } catch (usageError) {
      try {
        await DialogueGeneration.deleteOne({ _id: dialogueObjectId });
        await deleteBackblazeFile({
          fileName: upload.fileName,
          fileId: upload.fileId,
        });
      } catch (cleanupError) {
        throw new Error(
          "Failed to update user usage (and cleanup also failed)",
          {
            cause: { usageError, cleanupError },
          }
        );
      }

      throw new Error("Failed to update user usage", { cause: usageError });
    }

    // 12) PostHog analytics
    capturePosthogServerEvent({
      distinctId: userId,
      event: "dialogue_generated",
      properties: {
        feature: "text-to-dialogue",
        userId,
        plan: user.plan,
        dialogueId,
        totalCharacters: totalChars,
        lineCount: inputs.length,
        durationSeconds: duration,
      },
    });

    // 13) Return structured response
    return {
      dialogueId,
      title,
      audioUrl: upload.url,
      inputs,
      duration,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "text-to-dialogue");
      scope.setTag("service", "textToDialogueService");
      scope.setUser({ id: userId });
      scope.setTag("userId", userId);

      scope.setContext("dialogue", {
        title,
        lineCount: inputs?.length ?? 0,
      });

      Sentry.captureException(error);
    });

    throw error;
  }
};

/**
 * Get a dialogue generation by ID
 */
export const getDialogue = async (dialogueId: string, userId: string) => {
  await connectToDB();

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error("User not found");
  }

  const dialogue = await DialogueGeneration.findOne({
    _id: dialogueId,
    userId: user._id,
  });

  if (!dialogue) {
    throw new Error("Dialogue not found");
  }

  return dialogue;
};

/**
 * Get user's dialogue generations
 */
export const getDialogues = async (userId: string, page = 1, limit = 10) => {
  await connectToDB();

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error("User not found");
  }

  const skip = (page - 1) * limit;

  const [dialogues, total] = await Promise.all([
    DialogueGeneration.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    DialogueGeneration.countDocuments({ userId: user._id }),
  ]);

  return {
    dialogues,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Delete a dialogue generation
 */
export const deleteDialogue = async (dialogueId: string, userId: string) => {
  await connectToDB();

  const user = await User.findOne({ clerkId: userId });
  if (!user) {
    throw new Error("User not found");
  }

  const dialogue = await DialogueGeneration.findOne({
    _id: dialogueId,
    userId: user._id,
  });

  if (!dialogue) {
    throw new Error("Dialogue not found");
  }

  // Delete from Backblaze
  if (dialogue.audioPath && dialogue.audioFileId) {
    try {
      await deleteBackblazeFile({
        fileName: dialogue.audioPath,
        fileId: dialogue.audioFileId,
      });
    } catch (error) {
      Sentry.captureException(error);
      // Continue with DB deletion even if Backblaze fails
    }
  }

  await DialogueGeneration.deleteOne({ _id: dialogueId });

  capturePosthogServerEvent({
    distinctId: userId,
    event: "dialogue_deleted",
    properties: {
      feature: "text-to-dialogue",
      userId,
      dialogueId,
    },
  });
};

/**
 * Stream dialogue audio from Backblaze
 */
export const streamDialogueAudio = async (dialogueId: string, userId: string) => {
  const dialogue = await getDialogue(dialogueId, userId);

  if (!dialogue.audioPath) {
    throw new Error("Audio file not found");
  }

  return downloadBackblazeFile({ fileName: dialogue.audioPath });
};
