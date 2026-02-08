export interface AudioNativeCreateRequest {
  name: string;
  title?: string;
  author?: string;
  voiceId?: string;
  modelId?: string;
  textColor?: string;
  backgroundColor?: string;
  autoConvert?: boolean;
  applyTextNormalization?: "auto" | "on" | "off" | "apply_english";
}

export interface AudioNativeUpdateRequest {
  projectId: string;
  autoConvert?: boolean;
  autoPublish?: boolean;
}
