// src/lib/providers/index.ts
export type {
  ProviderType,
  TTSRequest,
  TTSResponse,
  VoiceCloneRequest,
  VoiceCloneResponse,
  VoiceDesignRequest,
  VoiceDesignResponse,
  ProviderVoice,
} from "./types";

export * as minimax from "./minimax";
export * as noiz from "./noiz";

export function getProvider(provider: "elevenlabs" | "minimax" | "noiz") {
  switch (provider) {
    case "minimax":
      return import("./minimax");
    case "noiz":
      return import("./noiz");
    case "elevenlabs":
      throw new Error(
        "ElevenLabs provider not yet migrated to the provider abstraction layer. " +
          "Use the existing services in src/lib/services/ for ElevenLabs."
      );
    default: {
      const _exhaustive: never = provider;
      throw new Error(`Unknown provider: ${_exhaustive}`);
    }
  }
}
