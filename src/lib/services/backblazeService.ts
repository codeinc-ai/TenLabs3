// src/lib/services/backblazeService.ts
import "server-only";

import * as Sentry from "@sentry/nextjs";
import { createHash } from "crypto";

/**
 * ==========================================
 * Backblaze B2 Service (Stateless)
 * ==========================================
 * This module wraps the Backblaze B2 Native API (b2_* endpoints).
 *
 * Design goals:
 * - Stateless: no in-memory caching of auth tokens (safe for serverless)
 * - Reusable: no Next.js request/response logic inside
 * - Typed I/O: explicit input/output contracts
 * - Production-ready error handling: throw meaningful errors (Sentry-friendly)
 */

export interface BackblazeConfig {
  keyId: string;
  appKey: string;
  bucketId: string;
  bucketName: string;
}

export interface UploadAudioInput {
  /** Clerk user id (used only for path organization). */
  userId: string;
  /** Generation id (typically the MongoDB document _id). */
  generationId: string;
  /** MP3 bytes. */
  audioBuffer: Buffer;
  /** Optional date (useful for deterministic tests/backfills). Defaults to now. */
  date?: Date;
}

export interface UploadAudioResult {
  /** Backblaze file id (useful for deletions without listing). */
  fileId: string;
  /** Backblaze file name (key) e.g. audio/{userId}/2026/01/{generationId}.mp3 */
  fileName: string;
  /** Public or signed download URL (depends on bucket settings and call path). */
  url: string;
  /** Integrity hash used for upload. */
  sha1: string;
  contentLength: number;
}

export interface GetDownloadUrlInput {
  fileName: string;
  /**
   * If true, generates a signed download URL.
   * If false, returns the public URL (works only for public buckets).
   */
  signed?: boolean;
  /** Only used when signed=true. Defaults to 10 minutes. */
  expiresInSeconds?: number;
}

export interface GetDownloadUrlResult {
  fileName: string;
  url: string;
  signed: boolean;
  expiresInSeconds?: number;
}

export interface DeleteFileInput {
  fileName: string;
  /** Optional fileId (if known). Avoids needing to list versions. */
  fileId?: string;
}

export interface DeleteFileResult {
  fileName: string;
  fileId: string;
  deleted: true;
}

class BackblazeServiceError extends Error {
  public readonly context?: Record<string, unknown>;

  constructor(message: string, opts?: { cause?: unknown; context?: Record<string, unknown> }) {
    // `cause` is supported in modern Node and is Sentry-friendly.
    super(message, { cause: opts?.cause });
    this.name = "BackblazeServiceError";
    this.context = opts?.context;
  }
}

function requireEnv(name: keyof BackblazeConfig | string): string {
  const value = process.env[name];
  if (!value) {
    throw new BackblazeServiceError(`Missing required environment variable: ${name}`);
  }
  return value;
}

function getConfig(): BackblazeConfig {
  return {
    keyId: requireEnv("B2_KEY_ID"),
    appKey: requireEnv("B2_APP_KEY"),
    bucketId: requireEnv("B2_BUCKET_ID"),
    bucketName: requireEnv("B2_BUCKET_NAME"),
  };
}

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

/**
 * Builds the canonical B2 file name for a generated audio mp3.
 *
 * Note: Backblaze refers to this as the "fileName".
 * We keep it relative (no leading slash) to match B2 expectations.
 */
export function buildAudioFileName(input: {
  userId: string;
  generationId: string;
  date?: Date;
}): string {
  const d = input.date ?? new Date();
  const year = d.getUTCFullYear();
  const month = pad2(d.getUTCMonth() + 1);

  return `audio/${input.userId}/${year}/${month}/${input.generationId}.mp3`;
}

/**
 * Builds the canonical B2 file name for a transcription audio file.
 */
export function buildTranscriptAudioFileName(input: {
  userId: string;
  transcriptionId: string;
  extension: string;
  date?: Date;
}): string {
  const d = input.date ?? new Date();
  const year = d.getUTCFullYear();
  const month = pad2(d.getUTCMonth() + 1);

  return `transcripts/${input.userId}/${year}/${month}/${input.transcriptionId}.${input.extension}`;
}

/**
 * Builds the canonical B2 file name for a sound effect audio file.
 */
export function buildSoundEffectFileName(input: {
  userId: string;
  soundEffectId: string;
  date?: Date;
}): string {
  const d = input.date ?? new Date();
  const year = d.getUTCFullYear();
  const month = pad2(d.getUTCMonth() + 1);

  return `soundeffects/${input.userId}/${year}/${month}/${input.soundEffectId}.mp3`;
}

/**
 * Builds the canonical B2 file name for a voice conversion audio file.
 */
export function buildVoiceConversionFileName(input: {
  userId: string;
  conversionId: string;
  type: "original" | "converted";
  extension: string;
  date?: Date;
}): string {
  const d = input.date ?? new Date();
  const year = d.getUTCFullYear();
  const month = pad2(d.getUTCMonth() + 1);

  return `voiceconversions/${input.userId}/${year}/${month}/${input.conversionId}_${input.type}.${input.extension}`;
}

/**
 * Builds the canonical B2 file name for a voice isolation audio file.
 */
export function buildVoiceIsolationFileName(input: {
  userId: string;
  isolationId: string;
  type: "original" | "isolated";
  extension: string;
  date?: Date;
}): string {
  const d = input.date ?? new Date();
  const year = d.getUTCFullYear();
  const month = pad2(d.getUTCMonth() + 1);

  return `voiceisolations/${input.userId}/${year}/${month}/${input.isolationId}_${input.type}.${input.extension}`;
}

/**
 * Builds the canonical B2 file name for a dubbing audio file.
 */
export function buildDubbingFileName(input: {
  userId: string;
  projectId: string;
  type: "original" | "dubbed";
  languageCode?: string;
  extension: string;
  date?: Date;
}): string {
  const d = input.date ?? new Date();
  const year = d.getUTCFullYear();
  const month = pad2(d.getUTCMonth() + 1);

  if (input.type === "original") {
    return `dubbings/${input.userId}/${year}/${month}/${input.projectId}_original.${input.extension}`;
  } else {
    return `dubbings/${input.userId}/${year}/${month}/${input.projectId}_${input.languageCode}.${input.extension}`;
  }
}

function encodeFileNameForHeader(fileName: string): string {
  // B2 requires URL-encoding for X-Bz-File-Name.
  return encodeURIComponent(fileName);
}

function encodeFileNameForUrlPath(fileName: string): string {
  // Encode each segment but keep slashes.
  return fileName
    .split("/")
    .map((segment) => encodeURIComponent(segment))
    .join("/");
}

async function assertOk(res: Response, context: Record<string, unknown>): Promise<void> {
  if (res.ok) return;

  // B2 returns JSON bodies for most errors, but text is safest.
  const body = await res.text().catch(() => "");
  throw new BackblazeServiceError(`Backblaze request failed (${res.status})`, {
    context: { ...context, status: res.status, body },
  });
}

async function authorizeAccount(config: BackblazeConfig): Promise<{
  apiUrl: string;
  downloadUrl: string;
  authorizationToken: string;
}> {
  const auth = Buffer.from(`${config.keyId}:${config.appKey}`).toString("base64");

  const res = await fetch("https://api.backblazeb2.com/b2api/v2/b2_authorize_account", {
    method: "GET",
    headers: {
      Authorization: `Basic ${auth}`,
    },
  });

  await assertOk(res, { op: "b2_authorize_account" });

  const json = (await res.json()) as {
    apiUrl: string;
    downloadUrl: string;
    authorizationToken: string;
  };

  if (!json.apiUrl || !json.downloadUrl || !json.authorizationToken) {
    throw new BackblazeServiceError("Unexpected Backblaze authorize response", {
      context: { op: "b2_authorize_account", json },
    });
  }

  return json;
}

async function getUploadUrl(params: {
  apiUrl: string;
  authorizationToken: string;
  bucketId: string;
}): Promise<{ uploadUrl: string; uploadAuthorizationToken: string }> {
  const res = await fetch(`${params.apiUrl}/b2api/v2/b2_get_upload_url`, {
    method: "POST",
    headers: {
      Authorization: params.authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ bucketId: params.bucketId }),
  });

  await assertOk(res, { op: "b2_get_upload_url" });

  const json = (await res.json()) as {
    uploadUrl: string;
    authorizationToken: string;
  };

  if (!json.uploadUrl || !json.authorizationToken) {
    throw new BackblazeServiceError("Unexpected Backblaze upload URL response", {
      context: { op: "b2_get_upload_url", json },
    });
  }

  return { uploadUrl: json.uploadUrl, uploadAuthorizationToken: json.authorizationToken };
}

export interface UploadTranscriptAudioInput {
  /** Clerk user id (used only for path organization). */
  userId: string;
  /** Transcription id (typically the MongoDB document _id). */
  transcriptionId: string;
  /** Audio bytes. */
  audioBuffer: Buffer;
  /** File extension (mp3, wav, etc.). */
  extension: string;
  /** MIME type of the audio file. */
  contentType: string;
  /** Optional date (useful for deterministic tests/backfills). Defaults to now. */
  date?: Date;
}

export async function uploadTranscriptAudioToBackblaze(input: UploadTranscriptAudioInput): Promise<UploadAudioResult> {
  try {
    const config = getConfig();

    if (!input.audioBuffer?.byteLength) {
      throw new BackblazeServiceError("Cannot upload empty audio buffer", {
        context: { op: "uploadTranscriptAudioToBackblaze" },
      });
    }

    const fileName = buildTranscriptAudioFileName({
      userId: input.userId,
      transcriptionId: input.transcriptionId,
      extension: input.extension,
      date: input.date,
    });

    const sha1 = createHash("sha1").update(input.audioBuffer).digest("hex");

    const auth = await authorizeAccount(config);
    const uploadUrl = await getUploadUrl({
      apiUrl: auth.apiUrl,
      authorizationToken: auth.authorizationToken,
      bucketId: config.bucketId,
    });

    const res = await fetch(uploadUrl.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadUrl.uploadAuthorizationToken,
        "X-Bz-File-Name": encodeFileNameForHeader(fileName),
        "Content-Type": input.contentType,
        "Content-Length": String(input.audioBuffer.byteLength),
        "X-Bz-Content-Sha1": sha1,
      },
      body: input.audioBuffer as unknown as BodyInit,
    });

    await assertOk(res, { op: "b2_upload_file", fileName });

    const json = (await res.json()) as {
      fileId: string;
      fileName: string;
      contentLength: number;
      contentSha1: string;
    };

    if (!json.fileId || !json.fileName) {
      throw new BackblazeServiceError("Unexpected Backblaze upload response", {
        context: { op: "b2_upload_file", json },
      });
    }

    const url = `${auth.downloadUrl}/file/${config.bucketName}/${encodeFileNameForUrlPath(fileName)}`;

    return {
      fileId: json.fileId,
      fileName: json.fileName,
      url,
      sha1: json.contentSha1 ?? sha1,
      contentLength: json.contentLength ?? input.audioBuffer.byteLength,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "stt");
      scope.setTag("service", "backblaze");
      scope.setTag("operation", "upload");
      scope.setUser({ id: input.userId });
      scope.setTag("userId", input.userId);

      scope.setContext("backblaze", {
        transcriptionId: input.transcriptionId,
        contentLength: input.audioBuffer?.byteLength ?? 0,
      });

      Sentry.captureException(error);
    });

    throw error;
  }
}

export interface UploadSoundEffectInput {
  userId: string;
  soundEffectId: string;
  audioBuffer: Buffer;
  date?: Date;
}

export interface UploadVoiceConversionInput {
  userId: string;
  conversionId: string;
  audioBuffer: Buffer;
  type: "original" | "converted";
  extension: string;
  contentType: string;
  date?: Date;
}

export interface UploadVoiceIsolationInput {
  userId: string;
  isolationId: string;
  audioBuffer: Buffer;
  type: "original" | "isolated";
  extension: string;
  contentType: string;
  date?: Date;
}

export interface UploadDubbingInput {
  userId: string;
  projectId: string;
  audioBuffer: Buffer;
  type: "original" | "dubbed";
  languageCode?: string;
  extension: string;
  contentType: string;
  date?: Date;
}

export async function uploadSoundEffectToBackblaze(input: UploadSoundEffectInput): Promise<UploadAudioResult> {
  try {
    const config = getConfig();

    if (!input.audioBuffer?.byteLength) {
      throw new BackblazeServiceError("Cannot upload empty audio buffer", {
        context: { op: "uploadSoundEffectToBackblaze" },
      });
    }

    const fileName = buildSoundEffectFileName({
      userId: input.userId,
      soundEffectId: input.soundEffectId,
      date: input.date,
    });

    const sha1 = createHash("sha1").update(input.audioBuffer).digest("hex");

    const auth = await authorizeAccount(config);
    const uploadUrl = await getUploadUrl({
      apiUrl: auth.apiUrl,
      authorizationToken: auth.authorizationToken,
      bucketId: config.bucketId,
    });

    const res = await fetch(uploadUrl.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadUrl.uploadAuthorizationToken,
        "X-Bz-File-Name": encodeFileNameForHeader(fileName),
        "Content-Type": "audio/mpeg",
        "Content-Length": String(input.audioBuffer.byteLength),
        "X-Bz-Content-Sha1": sha1,
      },
      body: input.audioBuffer as unknown as BodyInit,
    });

    await assertOk(res, { op: "b2_upload_file", fileName });

    const json = (await res.json()) as {
      fileId: string;
      fileName: string;
      contentLength: number;
      contentSha1: string;
    };

    if (!json.fileId || !json.fileName) {
      throw new BackblazeServiceError("Unexpected Backblaze upload response", {
        context: { op: "b2_upload_file", json },
      });
    }

    const url = `${auth.downloadUrl}/file/${config.bucketName}/${encodeFileNameForUrlPath(fileName)}`;

    return {
      fileId: json.fileId,
      fileName: json.fileName,
      url,
      sha1: json.contentSha1 ?? sha1,
      contentLength: json.contentLength ?? input.audioBuffer.byteLength,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "sfx");
      scope.setTag("service", "backblaze");
      scope.setTag("operation", "upload");
      scope.setUser({ id: input.userId });
      scope.setTag("userId", input.userId);

      scope.setContext("backblaze", {
        soundEffectId: input.soundEffectId,
        contentLength: input.audioBuffer?.byteLength ?? 0,
      });

      Sentry.captureException(error);
    });

    throw error;
  }
}

export async function uploadVoiceConversionToBackblaze(input: UploadVoiceConversionInput): Promise<UploadAudioResult> {
  try {
    const config = getConfig();

    if (!input.audioBuffer?.byteLength) {
      throw new BackblazeServiceError("Cannot upload empty audio buffer", {
        context: { op: "uploadVoiceConversionToBackblaze" },
      });
    }

    const fileName = buildVoiceConversionFileName({
      userId: input.userId,
      conversionId: input.conversionId,
      type: input.type,
      extension: input.extension,
      date: input.date,
    });

    const sha1 = createHash("sha1").update(input.audioBuffer).digest("hex");

    const auth = await authorizeAccount(config);
    const uploadUrl = await getUploadUrl({
      apiUrl: auth.apiUrl,
      authorizationToken: auth.authorizationToken,
      bucketId: config.bucketId,
    });

    const res = await fetch(uploadUrl.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadUrl.uploadAuthorizationToken,
        "X-Bz-File-Name": encodeFileNameForHeader(fileName),
        "Content-Type": input.contentType,
        "Content-Length": String(input.audioBuffer.byteLength),
        "X-Bz-Content-Sha1": sha1,
      },
      body: input.audioBuffer as unknown as BodyInit,
    });

    await assertOk(res, { op: "b2_upload_file", fileName });

    const json = (await res.json()) as {
      fileId: string;
      fileName: string;
      contentLength: number;
      contentSha1: string;
    };

    if (!json.fileId || !json.fileName) {
      throw new BackblazeServiceError("Unexpected Backblaze upload response", {
        context: { op: "b2_upload_file", json },
      });
    }

    const url = `${auth.downloadUrl}/file/${config.bucketName}/${encodeFileNameForUrlPath(fileName)}`;

    return {
      fileId: json.fileId,
      fileName: json.fileName,
      url,
      sha1: json.contentSha1 ?? sha1,
      contentLength: json.contentLength ?? input.audioBuffer.byteLength,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-changer");
      scope.setTag("service", "backblaze");
      scope.setTag("operation", "upload");
      scope.setUser({ id: input.userId });
      scope.setTag("userId", input.userId);

      scope.setContext("backblaze", {
        conversionId: input.conversionId,
        type: input.type,
        contentLength: input.audioBuffer?.byteLength ?? 0,
      });

      Sentry.captureException(error);
    });

    throw error;
  }
}

export async function uploadVoiceIsolationToBackblaze(input: UploadVoiceIsolationInput): Promise<UploadAudioResult> {
  try {
    const config = getConfig();

    if (!input.audioBuffer?.byteLength) {
      throw new BackblazeServiceError("Cannot upload empty audio buffer", {
        context: { op: "uploadVoiceIsolationToBackblaze" },
      });
    }

    const fileName = buildVoiceIsolationFileName({
      userId: input.userId,
      isolationId: input.isolationId,
      type: input.type,
      extension: input.extension,
      date: input.date,
    });

    const sha1 = createHash("sha1").update(input.audioBuffer).digest("hex");

    const auth = await authorizeAccount(config);
    const uploadUrl = await getUploadUrl({
      apiUrl: auth.apiUrl,
      authorizationToken: auth.authorizationToken,
      bucketId: config.bucketId,
    });

    const res = await fetch(uploadUrl.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadUrl.uploadAuthorizationToken,
        "X-Bz-File-Name": encodeFileNameForHeader(fileName),
        "Content-Type": input.contentType,
        "Content-Length": String(input.audioBuffer.byteLength),
        "X-Bz-Content-Sha1": sha1,
      },
      body: input.audioBuffer as unknown as BodyInit,
    });

    await assertOk(res, { op: "b2_upload_file", fileName });

    const json = (await res.json()) as {
      fileId: string;
      fileName: string;
      contentLength: number;
      contentSha1: string;
    };

    if (!json.fileId || !json.fileName) {
      throw new BackblazeServiceError("Unexpected Backblaze upload response", {
        context: { op: "b2_upload_file", json },
      });
    }

    const url = `${auth.downloadUrl}/file/${config.bucketName}/${encodeFileNameForUrlPath(fileName)}`;

    return {
      fileId: json.fileId,
      fileName: json.fileName,
      url,
      sha1: json.contentSha1 ?? sha1,
      contentLength: json.contentLength ?? input.audioBuffer.byteLength,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "voice-isolator");
      scope.setTag("service", "backblaze");
      scope.setTag("operation", "upload");
      scope.setUser({ id: input.userId });
      scope.setTag("userId", input.userId);

      scope.setContext("backblaze", {
        isolationId: input.isolationId,
        type: input.type,
        contentLength: input.audioBuffer?.byteLength ?? 0,
      });

      Sentry.captureException(error);
    });

    throw error;
  }
}

export async function uploadDubbingToBackblaze(input: UploadDubbingInput): Promise<UploadAudioResult> {
  try {
    const config = getConfig();

    if (!input.audioBuffer?.byteLength) {
      throw new BackblazeServiceError("Cannot upload empty audio buffer", {
        context: { op: "uploadDubbingToBackblaze" },
      });
    }

    const fileName = buildDubbingFileName({
      userId: input.userId,
      projectId: input.projectId,
      type: input.type,
      languageCode: input.languageCode,
      extension: input.extension,
      date: input.date,
    });

    const sha1 = createHash("sha1").update(input.audioBuffer).digest("hex");

    const auth = await authorizeAccount(config);
    const uploadUrl = await getUploadUrl({
      apiUrl: auth.apiUrl,
      authorizationToken: auth.authorizationToken,
      bucketId: config.bucketId,
    });

    const res = await fetch(uploadUrl.uploadUrl, {
      method: "POST",
      headers: {
        Authorization: uploadUrl.uploadAuthorizationToken,
        "X-Bz-File-Name": encodeFileNameForHeader(fileName),
        "Content-Type": input.contentType,
        "Content-Length": String(input.audioBuffer.byteLength),
        "X-Bz-Content-Sha1": sha1,
      },
      body: input.audioBuffer as unknown as BodyInit,
    });

    await assertOk(res, { op: "b2_upload_file", fileName });

    const json = (await res.json()) as {
      fileId: string;
      fileName: string;
      contentLength: number;
      contentSha1: string;
    };

    if (!json.fileId || !json.fileName) {
      throw new BackblazeServiceError("Unexpected Backblaze upload response", {
        context: { op: "b2_upload_file", json },
      });
    }

    const url = `${auth.downloadUrl}/file/${config.bucketName}/${encodeFileNameForUrlPath(fileName)}`;

    return {
      fileId: json.fileId,
      fileName: json.fileName,
      url,
      sha1: json.contentSha1 ?? sha1,
      contentLength: json.contentLength ?? input.audioBuffer.byteLength,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "dubbing");
      scope.setTag("service", "backblaze");
      scope.setTag("operation", "upload");
      scope.setUser({ id: input.userId });
      scope.setTag("userId", input.userId);

      scope.setContext("backblaze", {
        projectId: input.projectId,
        type: input.type,
        languageCode: input.languageCode,
        contentLength: input.audioBuffer?.byteLength ?? 0,
      });

      Sentry.captureException(error);
    });

    throw error;
  }
}

export async function uploadAudioMp3ToBackblaze(input: UploadAudioInput): Promise<UploadAudioResult> {
  try {
    const config = getConfig();

    if (!input.audioBuffer?.byteLength) {
      throw new BackblazeServiceError("Cannot upload empty audio buffer", {
        context: { op: "uploadAudioMp3ToBackblaze" },
      });
    }

  const fileName = buildAudioFileName({
    userId: input.userId,
    generationId: input.generationId,
    date: input.date,
  });

  const sha1 = createHash("sha1").update(input.audioBuffer).digest("hex");

  const auth = await authorizeAccount(config);
  const uploadUrl = await getUploadUrl({
    apiUrl: auth.apiUrl,
    authorizationToken: auth.authorizationToken,
    bucketId: config.bucketId,
  });

  const res = await fetch(uploadUrl.uploadUrl, {
    method: "POST",
    headers: {
      Authorization: uploadUrl.uploadAuthorizationToken,
      "X-Bz-File-Name": encodeFileNameForHeader(fileName),
      "Content-Type": "audio/mpeg",
      "Content-Length": String(input.audioBuffer.byteLength),
      "X-Bz-Content-Sha1": sha1,
    },
    // TS note: DOM's `fetch` types don't include Node's Buffer in BodyInit.
    // At runtime (Node/Next server), Buffer is supported.
    body: input.audioBuffer as unknown as BodyInit,
  });

  await assertOk(res, { op: "b2_upload_file", fileName });

  const json = (await res.json()) as {
    fileId: string;
    fileName: string;
    contentLength: number;
    contentSha1: string;
  };

  if (!json.fileId || !json.fileName) {
    throw new BackblazeServiceError("Unexpected Backblaze upload response", {
      context: { op: "b2_upload_file", json },
    });
  }

  // For public buckets this URL is immediately usable.
  const url = `${auth.downloadUrl}/file/${config.bucketName}/${encodeFileNameForUrlPath(fileName)}`;

    return {
      fileId: json.fileId,
      fileName: json.fileName,
      url,
      sha1: json.contentSha1 ?? sha1,
      contentLength: json.contentLength ?? input.audioBuffer.byteLength,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("service", "backblaze");
      scope.setTag("operation", "upload");
      scope.setUser({ id: input.userId });
      scope.setTag("userId", input.userId);

      scope.setContext("backblaze", {
        generationId: input.generationId,
        contentLength: input.audioBuffer?.byteLength ?? 0,
      });

      Sentry.captureException(error);
    });

    throw error;
  }
}

async function getDownloadAuthorization(params: {
  apiUrl: string;
  authorizationToken: string;
  bucketId: string;
  fileNamePrefix: string;
  validDurationInSeconds: number;
}): Promise<{ authorizationToken: string }> {
  const res = await fetch(`${params.apiUrl}/b2api/v2/b2_get_download_authorization`, {
    method: "POST",
    headers: {
      Authorization: params.authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bucketId: params.bucketId,
      fileNamePrefix: params.fileNamePrefix,
      validDurationInSeconds: params.validDurationInSeconds,
    }),
  });

  await assertOk(res, { op: "b2_get_download_authorization" });

  const json = (await res.json()) as { authorizationToken: string };
  if (!json.authorizationToken) {
    throw new BackblazeServiceError("Unexpected Backblaze download authorization response", {
      context: { op: "b2_get_download_authorization", json },
    });
  }

  return json;
}

export async function getBackblazeDownloadUrl(input: GetDownloadUrlInput): Promise<GetDownloadUrlResult> {
  try {
    const config = getConfig();
    const signed = Boolean(input.signed);

    const auth = await authorizeAccount(config);
    const baseUrl = `${auth.downloadUrl}/file/${config.bucketName}/${encodeFileNameForUrlPath(input.fileName)}`;

    if (!signed) {
      return { fileName: input.fileName, url: baseUrl, signed: false };
    }

  const expiresInSeconds = input.expiresInSeconds ?? 600;
  if (expiresInSeconds <= 0) {
    throw new BackblazeServiceError("expiresInSeconds must be > 0", {
      context: { op: "getBackblazeDownloadUrl", expiresInSeconds },
    });
  }

  const token = await getDownloadAuthorization({
    apiUrl: auth.apiUrl,
    authorizationToken: auth.authorizationToken,
    bucketId: config.bucketId,
    fileNamePrefix: input.fileName,
    validDurationInSeconds: expiresInSeconds,
  });

    const url = `${baseUrl}?Authorization=${encodeURIComponent(token.authorizationToken)}`;
    return { fileName: input.fileName, url, signed: true, expiresInSeconds };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("service", "backblaze");
      scope.setTag("operation", "getDownloadUrl");
      scope.setContext("backblaze", { fileName: input.fileName, signed: Boolean(input.signed) });
      Sentry.captureException(error);
    });

    throw error;
  }
}

async function listFileVersions(params: {
  apiUrl: string;
  authorizationToken: string;
  bucketId: string;
  fileName: string;
}): Promise<{ fileId: string; fileName: string } | null> {
  const res = await fetch(`${params.apiUrl}/b2api/v2/b2_list_file_versions`, {
    method: "POST",
    headers: {
      Authorization: params.authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      bucketId: params.bucketId,
      startFileName: params.fileName,
      maxFileCount: 1,
    }),
  });

  await assertOk(res, { op: "b2_list_file_versions", fileName: params.fileName });

  const json = (await res.json()) as {
    files: Array<{ fileId: string; fileName: string }>;
  };

  const match = json.files?.[0];
  if (!match || match.fileName !== params.fileName) return null;

  return { fileId: match.fileId, fileName: match.fileName };
}

async function deleteFileVersion(params: {
  apiUrl: string;
  authorizationToken: string;
  fileId: string;
  fileName: string;
}): Promise<void> {
  const res = await fetch(`${params.apiUrl}/b2api/v2/b2_delete_file_version`, {
    method: "POST",
    headers: {
      Authorization: params.authorizationToken,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ fileId: params.fileId, fileName: params.fileName }),
  });

  await assertOk(res, { op: "b2_delete_file_version", fileName: params.fileName, fileId: params.fileId });
  // Body contains metadata but we don't need it.
}

export interface DownloadFileInput {
  fileName: string;
}

export interface DownloadFileResult {
  buffer: Buffer;
  contentType: string;
  contentLength: number;
}

export async function downloadBackblazeFile(input: DownloadFileInput): Promise<DownloadFileResult> {
  try {
    const config = getConfig();
    const auth = await authorizeAccount(config);

    const url = `${auth.downloadUrl}/file/${config.bucketName}/${encodeFileNameForUrlPath(input.fileName)}`;

    const res = await fetch(url, {
      headers: {
        Authorization: auth.authorizationToken,
      },
    });

    await assertOk(res, { op: "downloadBackblazeFile", fileName: input.fileName });

    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    return {
      buffer,
      contentType: res.headers.get("content-type") || "audio/mpeg",
      contentLength: buffer.byteLength,
    };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("service", "backblaze");
      scope.setTag("operation", "download");
      scope.setContext("backblaze", { fileName: input.fileName });
      Sentry.captureException(error);
    });

    throw error;
  }
}

export async function deleteBackblazeFile(input: DeleteFileInput): Promise<DeleteFileResult> {
  try {
    const config = getConfig();

    const auth = await authorizeAccount(config);

    let fileId = input.fileId;
    if (!fileId) {
      const found = await listFileVersions({
        apiUrl: auth.apiUrl,
        authorizationToken: auth.authorizationToken,
        bucketId: config.bucketId,
        fileName: input.fileName,
      });

      if (!found) {
        throw new BackblazeServiceError("Backblaze file not found", {
          context: { op: "deleteBackblazeFile", fileName: input.fileName },
        });
      }

      fileId = found.fileId;
    }

    await deleteFileVersion({
      apiUrl: auth.apiUrl,
      authorizationToken: auth.authorizationToken,
      fileId,
      fileName: input.fileName,
    });

    return { fileName: input.fileName, fileId, deleted: true };
  } catch (error) {
    Sentry.withScope((scope) => {
      scope.setTag("feature", "tts");
      scope.setTag("service", "backblaze");
      scope.setTag("operation", "delete");
      scope.setContext("backblaze", { fileName: input.fileName, hasFileId: Boolean(input.fileId) });
      Sentry.captureException(error);
    });

    throw error;
  }
}
