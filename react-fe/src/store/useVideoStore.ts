import { create } from "zustand";

export type UploadStatus = "pending" | "uploading" | "success" | "error";

export interface VideoMetadata {
  name: string;
  size: number;
  type: string;
  duration: number;
  width: number;
  height: number;
  aspectRatio: number;
}

export interface UploadedVideo {
  file: File;
  metadata: VideoMetadata;
  status: UploadStatus;
  error?: string;
  videoId?: string;
  progress: number;
  s3Key?: string;
}

interface VideoStore {
  selectedFiles: UploadedVideo[];
  uploading: boolean;
  setUploading: (uploading: boolean) => void;
  addVideos: (videos: UploadedVideo[]) => void;
  removeVideo: (index: number) => void;
  updateFileStatus: (index: number, updates: Partial<UploadedVideo>) => void;
  reset: () => void;
}

export const useVideoStore = create<VideoStore>((set) => ({
  selectedFiles: [],
  uploading: false,

  setUploading: (uploading) => set({ uploading }),

  addVideos: (videos) =>
    set((state) => ({ selectedFiles: [...state.selectedFiles, ...videos] })),

  removeVideo: (index) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.filter((_, i) => i !== index),
    })),

  updateFileStatus: (index, updates) =>
    set((state) => ({
      selectedFiles: state.selectedFiles.map((file, i) =>
        i === index ? { ...file, ...updates } : file
      ),
    })),

  reset: () => set({ selectedFiles: [], uploading: false }),
}));