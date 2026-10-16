export interface PhotoSizePreset {
  id: string;
  name: string;
  label: string;
  widthMm: number;
  heightMm: number;
  aspectRatio: number; // width / height
  widthPx300Dpi: number;
  heightPx300Dpi: number;
  description: string;
  recommendedFor: string[];
}

export interface BackgroundColorPreset {
  id: string;
  name: string;
  hex: string;
  label: string;
  tag?: string;
}

export interface PrintLayoutPreset {
  id: string;
  name: string;
  paperName: string;
  paperWidthMm: number;
  paperHeightMm: number;
  description: string;
  slots: {
    sizePresetId: string;
    count: number;
  }[];
}

export interface ProcessingState {
  status: "idle" | "uploading" | "removing_bg" | "ready" | "exporting" | "error";
  progress?: number;
  errorMessage?: string;
}
