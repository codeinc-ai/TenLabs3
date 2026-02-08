export interface AudioNativeCreateResponse {
  projectId: string;
  converting: boolean;
  htmlSnippet: string;
}

export interface AudioNativeSettingsResponse {
  enabled?: boolean;
  snapshotId?: string;
  settings?: {
    title: string;
    image: string;
    author: string;
    small: boolean;
    textColor: string;
    backgroundColor: string;
    sessionization: number;
    audioPath?: string;
    audioUrl?: string;
    status?: "processing" | "ready";
  };
}

export interface AudioNativeUpdateResponse {
  projectId: string;
  converting: boolean;
  publishing: boolean;
  htmlSnippet: string;
}
