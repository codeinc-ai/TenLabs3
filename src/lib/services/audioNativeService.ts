import "server-only";

import * as Sentry from "@sentry/nextjs";
import { connectToDB } from "@/lib/mongodb";
import { User } from "@/models/User";
import { AudioNativeProject } from "@/models/AudioNativeProject";
import type { AudioNativeCreateRequest } from "@/types/AudioNativeRequest";
import type { AudioNativeCreateResponse, AudioNativeSettingsResponse, AudioNativeUpdateResponse } from "@/types/AudioNativeResponse";

const ELEVENLABS_API_BASE = "https://api.elevenlabs.io/v1";

function getApiKey(): string {
  const key = process.env.ELEVENLABS_API_KEY;
  if (!key) throw new Error("ELEVENLABS_API_KEY is not configured");
  return key;
}

export async function createAudioNativeProject(
  userId: string,
  request: AudioNativeCreateRequest,
  file?: Buffer,
  fileName?: string
): Promise<AudioNativeCreateResponse> {
  await connectToDB();

  const dbUser = await User.findOne({ clerkId: userId });
  if (!dbUser) throw new Error("User not found");

  const plan = dbUser.plan as string;
  if (plan !== "creator" && plan !== "pro") {
    throw new Error("Audio Native requires a Creator or Pro subscription");
  }

  const formData = new FormData();
  formData.append("name", request.name);
  if (request.title) formData.append("title", request.title);
  if (request.author) formData.append("author", request.author);
  if (request.voiceId) formData.append("voice_id", request.voiceId);
  if (request.modelId) formData.append("model_id", request.modelId);
  if (request.textColor) formData.append("text_color", request.textColor);
  if (request.backgroundColor) formData.append("background_color", request.backgroundColor);
  if (request.autoConvert !== undefined) formData.append("auto_convert", String(request.autoConvert));
  if (request.applyTextNormalization) formData.append("apply_text_normalization", request.applyTextNormalization);

  if (file && fileName) {
    const blob = new Blob([new Uint8Array(file)], { type: fileName.endsWith(".html") ? "text/html" : "text/plain" });
    formData.append("file", blob, fileName);
  }

  const res = await fetch(`${ELEVENLABS_API_BASE}/audio-native`, {
    method: "POST",
    headers: { "xi-api-key": getApiKey() },
    body: formData,
  });

  if (!res.ok) {
    const errorText = await res.text();
    Sentry.captureMessage(`ElevenLabs Audio Native create failed: ${res.status} ${errorText}`);
    throw new Error(`Failed to create Audio Native project: ${errorText}`);
  }

  const data = await res.json();

  await AudioNativeProject.create({
    userId: dbUser._id,
    name: request.name,
    elevenLabsProjectId: data.project_id,
    title: request.title,
    author: request.author,
    voiceId: request.voiceId,
    modelId: request.modelId,
    textColor: request.textColor,
    backgroundColor: request.backgroundColor,
    htmlSnippet: data.html_snippet,
    status: data.converting ? "processing" : "ready",
    autoConvert: request.autoConvert ?? false,
  });

  return {
    projectId: data.project_id,
    converting: data.converting,
    htmlSnippet: data.html_snippet,
  };
}

export async function getProjectSettings(
  userId: string,
  projectId: string
): Promise<AudioNativeSettingsResponse> {
  await connectToDB();

  const dbUser = await User.findOne({ clerkId: userId });
  if (!dbUser) throw new Error("User not found");

  const project = await AudioNativeProject.findOne({
    _id: projectId,
    userId: dbUser._id,
  });
  if (!project) throw new Error("Project not found");

  const res = await fetch(
    `${ELEVENLABS_API_BASE}/audio-native/${project.elevenLabsProjectId}/settings`,
    { headers: { "xi-api-key": getApiKey() } }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to get project settings: ${errorText}`);
  }

  return await res.json();
}

export async function updateProjectContent(
  userId: string,
  projectId: string,
  file: Buffer,
  fileName: string,
  autoConvert = false,
  autoPublish = false
): Promise<AudioNativeUpdateResponse> {
  await connectToDB();

  const dbUser = await User.findOne({ clerkId: userId });
  if (!dbUser) throw new Error("User not found");

  const project = await AudioNativeProject.findOne({
    _id: projectId,
    userId: dbUser._id,
  });
  if (!project) throw new Error("Project not found");

  const formData = new FormData();
  const blob = new Blob([new Uint8Array(file)], { type: fileName.endsWith(".html") ? "text/html" : "text/plain" });
  formData.append("file", blob, fileName);
  formData.append("auto_convert", String(autoConvert));
  formData.append("auto_publish", String(autoPublish));

  const res = await fetch(
    `${ELEVENLABS_API_BASE}/audio-native/${project.elevenLabsProjectId}/content`,
    {
      method: "POST",
      headers: { "xi-api-key": getApiKey() },
      body: formData,
    }
  );

  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`Failed to update project content: ${errorText}`);
  }

  const data = await res.json();

  project.status = data.converting ? "processing" : "ready";
  project.htmlSnippet = data.html_snippet;
  await project.save();

  return {
    projectId: data.project_id,
    converting: data.converting,
    publishing: data.publishing,
    htmlSnippet: data.html_snippet,
  };
}

export async function getUserAudioNativeProjects(userId: string) {
  await connectToDB();

  const dbUser = await User.findOne({ clerkId: userId });
  if (!dbUser) throw new Error("User not found");

  const projects = await AudioNativeProject.find({ userId: dbUser._id })
    .sort({ createdAt: -1 })
    .lean();

  return projects;
}
