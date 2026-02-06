// src/lib/providers/minimax/index.ts
export {
  generateSpeech,
  generateSpeechAsync,
  queryAsyncTask,
} from "./minimaxTtsService";

export type { MinimaxAsyncTaskStatus } from "./minimaxTtsService";

export {
  getVoices,
  deleteVoice,
  cloneVoice,
  uploadAudioForCloning,
  uploadPromptAudio,
  designVoice,
} from "./minimaxVoiceService";
