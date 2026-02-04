// src/lib/services/voiceCloningService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";

import { connectToDB } from "@/lib/mongodb";
import { Voice } from "@/models/Voice";
import { UserVoice } from "@/models/UserVoice";
import { User } from "@/models/User";
import { PLANS } from "@/constants";

const ELEVENLABS_API_URL = "https://api.elevenlabs.io/v1";

interface VoicePreview {
  generatedVoiceId: string;
  audioBase64: string;
  mediaType: string;
}

interface CreatedVoice {
  voiceId: string;
  name: string;
  description?: string;
}

async function getElevenLabsApiKey(): Promise<string> {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) {
    throw new Error("Missing ELEVENLABS_API_KEY environment variable");
  }
  return key;
}

async function validateVoiceSlots(clerkId: string): Promise<void> {
  await connectToDB();

  const user = await User.findOne({ clerkId });
  if (!user) {
    throw new Error("User not found");
  }

  const plan = user.plan as keyof typeof PLANS;
  const limits = PLANS[plan];

  const clonedVoicesCount = await Voice.countDocuments({ userId: clerkId });

  if (clonedVoicesCount >= limits.maxClonedVoices) {
    throw new Error(
      `Voice slot limit reached. Your ${plan} plan allows ${limits.maxClonedVoices} cloned/designed voices.`
    );
  }
}

async function saveVoiceToDb(
  clerkId: string,
  voiceId: string,
  name: string,
  description?: string,
  category: string = "Custom"
): Promise<CreatedVoice> {
  await connectToDB();

  const voice = await Voice.create({
    voiceId,
    name,
    userId: clerkId,
    isDefault: false,
    description,
    category,
    isFeatured: false,
    usageCount: 0,
  });

  await UserVoice.create({
    userId: clerkId,
    voiceId: voice._id,
    isFavorite: false,
  });

  return {
    voiceId: voice.voiceId,
    name: voice.name,
    description: voice.description,
  };
}

export async function createInstantVoiceClone(
  clerkId: string,
  name: string,
  files: File[],
  description?: string
): Promise<CreatedVoice> {
  try {
    await validateVoiceSlots(clerkId);

    const apiKey = await getElevenLabsApiKey();

    const formData = new FormData();
    formData.append("name", name);
    if (description) {
      formData.append("description", description);
    }

    for (const file of files) {
      formData.append("files", file);
    }

    const response = await fetch(`${ELEVENLABS_API_URL}/voices/add`, {
      method: "POST",
      headers: {
        "xi-api-key": apiKey,
      },
      body: formData,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const voiceId = data.voice_id as string;

    const savedVoice = await saveVoiceToDb(
      clerkId,
      voiceId,
      name,
      description,
      "Cloned"
    );

    return savedVoice;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-cloning");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "createInstantVoiceClone");
      scope.setUser({ id: clerkId });
      Sentry.captureException(error);
    });
    throw error;
  }
}

export async function generateVoiceDesignPreviews(
  clerkId: string,
  voiceDescription: string,
  sampleText: string
): Promise<VoicePreview[]> {
  try {
    const apiKey = await getElevenLabsApiKey();

    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-voice/create-previews`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          voice_description: voiceDescription,
          text: sampleText,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const previews: VoicePreview[] = (data.previews || []).map(
      (preview: { generated_voice_id: string; audio_base_64: string; media_type: string }) => ({
        generatedVoiceId: preview.generated_voice_id,
        audioBase64: preview.audio_base_64,
        mediaType: preview.media_type,
      })
    );

    return previews;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-design");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "generateVoiceDesignPreviews");
      scope.setUser({ id: clerkId });
      Sentry.captureException(error);
    });
    throw error;
  }
}

export async function designVoice(
  clerkId: string,
  voiceName: string,
  voiceDescription: string,
  generatedVoiceId: string
): Promise<CreatedVoice> {
  try {
    await validateVoiceSlots(clerkId);

    const apiKey = await getElevenLabsApiKey();

    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-voice/create-voice-from-preview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          voice_name: voiceName,
          voice_description: voiceDescription,
          generated_voice_id: generatedVoiceId,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const voiceId = data.voice_id as string;

    const savedVoice = await saveVoiceToDb(
      clerkId,
      voiceId,
      voiceName,
      voiceDescription,
      "Designed"
    );

    return savedVoice;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-design");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "designVoice");
      scope.setUser({ id: clerkId });
      Sentry.captureException(error);
    });
    throw error;
  }
}

export async function generateVoiceRemixPreviews(
  clerkId: string,
  voiceId: string,
  voiceDescription: string,
  sampleText: string
): Promise<VoicePreview[]> {
  try {
    const apiKey = await getElevenLabsApiKey();

    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-voice/${voiceId}/create-previews`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          voice_description: voiceDescription,
          text: sampleText,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const previews: VoicePreview[] = (data.previews || []).map(
      (preview: { generated_voice_id: string; audio_base_64: string; media_type: string }) => ({
        generatedVoiceId: preview.generated_voice_id,
        audioBase64: preview.audio_base_64,
        mediaType: preview.media_type,
      })
    );

    return previews;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-remix");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "generateVoiceRemixPreviews");
      scope.setUser({ id: clerkId });
      Sentry.captureException(error);
    });
    throw error;
  }
}

export async function remixVoice(
  clerkId: string,
  voiceName: string,
  voiceDescription: string,
  generatedVoiceId: string
): Promise<CreatedVoice> {
  try {
    await validateVoiceSlots(clerkId);

    const apiKey = await getElevenLabsApiKey();

    const response = await fetch(
      `${ELEVENLABS_API_URL}/text-to-voice/create-voice-from-preview`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          voice_name: voiceName,
          voice_description: voiceDescription,
          generated_voice_id: generatedVoiceId,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const voiceId = data.voice_id as string;

    const savedVoice = await saveVoiceToDb(
      clerkId,
      voiceId,
      voiceName,
      voiceDescription,
      "Remixed"
    );

    return savedVoice;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-remix");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "remixVoice");
      scope.setUser({ id: clerkId });
      Sentry.captureException(error);
    });
    throw error;
  }
}

// ==========================================
// Professional Voice Clone (PVC) Functions
// ==========================================

interface PVCVoiceResponse {
  voiceId: string;
  name: string;
  language: string;
  description?: string;
}

interface PVCSampleResponse {
  sampleId: string;
  fileName: string;
}

interface PVCSpeakerResponse {
  speakerId: string;
  audioBase64?: string;
}

interface PVCSeparationStatus {
  status: "pending" | "processing" | "completed" | "failed";
  speakers?: PVCSpeakerResponse[];
}

interface PVCTrainingStatusResponse {
  state: "not_started" | "pending" | "training" | "fine_tuned" | "failed";
  progress?: number;
  modelId?: string;
}

/**
 * Validate that user can use PVC (plan check)
 */
async function validatePVCAccess(clerkId: string): Promise<void> {
  await connectToDB();

  const user = await User.findOne({ clerkId });
  if (!user) {
    throw new Error("User not found");
  }

  const plan = user.plan as keyof typeof PLANS;
  const limits = PLANS[plan];

  if (!limits.canUsePVC) {
    throw new Error(
      `Professional Voice Clone requires a Pro plan or above. Please upgrade to access this feature.`
    );
  }
}

/**
 * Create a new Professional Voice Clone
 */
export async function createPVCVoice(
  clerkId: string,
  name: string,
  language: string,
  description?: string
): Promise<PVCVoiceResponse> {
  try {
    await validatePVCAccess(clerkId);
    await validateVoiceSlots(clerkId);

    const apiKey = await getElevenLabsApiKey();

    const response = await fetch(`${ELEVENLABS_API_URL}/voices/pvc/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": apiKey,
      },
      body: JSON.stringify({
        name,
        language,
        description,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    return {
      voiceId: data.voice_id,
      name: data.name || name,
      language: data.language || language,
      description: data.description || description,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "pvc");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "createPVCVoice");
      scope.setUser({ id: clerkId });
      Sentry.captureException(error);
    });
    throw error;
  }
}

/**
 * Upload audio samples for PVC training
 */
export async function uploadPVCSamples(
  clerkId: string,
  voiceId: string,
  files: File[]
): Promise<PVCSampleResponse[]> {
  try {
    await validatePVCAccess(clerkId);

    const apiKey = await getElevenLabsApiKey();

    const formData = new FormData();
    for (const file of files) {
      formData.append("files", file);
    }

    const response = await fetch(
      `${ELEVENLABS_API_URL}/voices/pvc/${voiceId}/samples/create`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const samples: PVCSampleResponse[] = (data || []).map(
      (sample: { sample_id: string; file_name?: string }) => ({
        sampleId: sample.sample_id,
        fileName: sample.file_name || "Unknown",
      })
    );

    return samples;
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "pvc");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "uploadPVCSamples");
      scope.setUser({ id: clerkId });
      scope.setExtra("voiceId", voiceId);
      Sentry.captureException(error);
    });
    throw error;
  }
}

/**
 * Trigger speaker separation for a sample
 */
export async function triggerSpeakerSeparation(
  clerkId: string,
  voiceId: string,
  sampleId: string
): Promise<void> {
  try {
    const apiKey = await getElevenLabsApiKey();

    const response = await fetch(
      `${ELEVENLABS_API_URL}/voices/pvc/${voiceId}/samples/${sampleId}/speakers/separate`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "pvc");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "triggerSpeakerSeparation");
      scope.setUser({ id: clerkId });
      scope.setExtra("voiceId", voiceId);
      scope.setExtra("sampleId", sampleId);
      Sentry.captureException(error);
    });
    throw error;
  }
}

/**
 * Get speaker separation status for a sample
 */
export async function getSpeakerSeparationStatus(
  clerkId: string,
  voiceId: string,
  sampleId: string
): Promise<PVCSeparationStatus> {
  try {
    const apiKey = await getElevenLabsApiKey();

    const response = await fetch(
      `${ELEVENLABS_API_URL}/voices/pvc/${voiceId}/samples/${sampleId}/speakers`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    const speakers: PVCSpeakerResponse[] | undefined = data.speakers
      ? Object.values(data.speakers).map((speaker: unknown) => {
          const s = speaker as { speaker_id: string };
          return {
            speakerId: s.speaker_id,
          };
        })
      : undefined;

    return {
      status: data.status,
      speakers,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "pvc");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "getSpeakerSeparationStatus");
      scope.setUser({ id: clerkId });
      scope.setExtra("voiceId", voiceId);
      scope.setExtra("sampleId", sampleId);
      Sentry.captureException(error);
    });
    throw error;
  }
}

/**
 * Get audio for a specific speaker from a sample
 */
export async function getSpeakerAudio(
  clerkId: string,
  voiceId: string,
  sampleId: string,
  speakerId: string
): Promise<{ audioBase64: string; mediaType: string }> {
  try {
    const apiKey = await getElevenLabsApiKey();

    const response = await fetch(
      `${ELEVENLABS_API_URL}/voices/pvc/${voiceId}/samples/${sampleId}/speakers/${speakerId}/audio`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();

    return {
      audioBase64: data.audio_base_64,
      mediaType: data.media_type || "audio/mpeg",
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "pvc");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "getSpeakerAudio");
      scope.setUser({ id: clerkId });
      scope.setExtra("voiceId", voiceId);
      scope.setExtra("sampleId", sampleId);
      scope.setExtra("speakerId", speakerId);
      Sentry.captureException(error);
    });
    throw error;
  }
}

/**
 * Select a speaker for a sample
 */
export async function selectSpeaker(
  clerkId: string,
  voiceId: string,
  sampleId: string,
  selectedSpeakerIds: string[]
): Promise<void> {
  try {
    const apiKey = await getElevenLabsApiKey();

    const response = await fetch(
      `${ELEVENLABS_API_URL}/voices/pvc/${voiceId}/samples/${sampleId}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          selected_speaker_ids: selectedSpeakerIds,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "pvc");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "selectSpeaker");
      scope.setUser({ id: clerkId });
      scope.setExtra("voiceId", voiceId);
      scope.setExtra("sampleId", sampleId);
      scope.setExtra("selectedSpeakerIds", selectedSpeakerIds);
      Sentry.captureException(error);
    });
    throw error;
  }
}

/**
 * Get CAPTCHA image for PVC verification
 */
export async function getPVCCaptcha(
  clerkId: string,
  voiceId: string
): Promise<{ captchaImage: string }> {
  try {
    const apiKey = await getElevenLabsApiKey();

    const response = await fetch(
      `${ELEVENLABS_API_URL}/voices/pvc/${voiceId}/verification/captcha`,
      {
        method: "GET",
        headers: {
          "xi-api-key": apiKey,
        },
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    // The response is base64 encoded image data
    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString("base64");

    return {
      captchaImage: base64,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "pvc");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "getPVCCaptcha");
      scope.setUser({ id: clerkId });
      scope.setExtra("voiceId", voiceId);
      Sentry.captureException(error);
    });
    throw error;
  }
}

/**
 * Verify PVC with recorded CAPTCHA audio
 */
export async function verifyPVCCaptcha(
  clerkId: string,
  voiceId: string,
  recording: File | Blob
): Promise<void> {
  try {
    const apiKey = await getElevenLabsApiKey();

    const formData = new FormData();
    formData.append("recording", recording);

    const response = await fetch(
      `${ELEVENLABS_API_URL}/voices/pvc/${voiceId}/verification/captcha`,
      {
        method: "POST",
        headers: {
          "xi-api-key": apiKey,
        },
        body: formData,
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "pvc");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "verifyPVCCaptcha");
      scope.setUser({ id: clerkId });
      scope.setExtra("voiceId", voiceId);
      Sentry.captureException(error);
    });
    throw error;
  }
}

/**
 * Start PVC training
 */
export async function trainPVC(
  clerkId: string,
  voiceId: string,
  modelId: string = "eleven_multilingual_v2"
): Promise<void> {
  try {
    const apiKey = await getElevenLabsApiKey();

    const response = await fetch(
      `${ELEVENLABS_API_URL}/voices/pvc/${voiceId}/train`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "xi-api-key": apiKey,
        },
        body: JSON.stringify({
          model_id: modelId,
        }),
      }
    );

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "pvc");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "trainPVC");
      scope.setUser({ id: clerkId });
      scope.setExtra("voiceId", voiceId);
      scope.setExtra("modelId", modelId);
      Sentry.captureException(error);
    });
    throw error;
  }
}

/**
 * Get PVC training status
 */
export async function getPVCTrainingStatus(
  clerkId: string,
  voiceId: string
): Promise<PVCTrainingStatusResponse> {
  try {
    const apiKey = await getElevenLabsApiKey();

    const response = await fetch(`${ELEVENLABS_API_URL}/voices/${voiceId}`, {
      method: "GET",
      headers: {
        "xi-api-key": apiKey,
      },
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`ElevenLabs API error (${response.status}): ${errorText}`);
    }

    const data = await response.json();
    const fineTuning = data.fine_tuning || {};
    const state = fineTuning.state?.eleven_multilingual_v2 || "not_started";
    const progress = fineTuning.progress?.eleven_multilingual_v2;

    return {
      state,
      progress,
      modelId: "eleven_multilingual_v2",
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "pvc");
      scope.setTag("service", "voiceCloningService");
      scope.setTag("action", "getPVCTrainingStatus");
      scope.setUser({ id: clerkId });
      scope.setExtra("voiceId", voiceId);
      Sentry.captureException(error);
    });
    throw error;
  }
}

/**
 * Save trained PVC voice to database
 */
export async function savePVCVoiceToDb(
  clerkId: string,
  voiceId: string,
  name: string,
  description?: string
): Promise<CreatedVoice> {
  return saveVoiceToDb(clerkId, voiceId, name, description, "Professional Clone");
}
