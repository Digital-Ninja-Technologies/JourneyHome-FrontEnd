import { toast } from "@journeyhome/ui/components/toast";
import { useState } from "react";
import { putToStorage, type UploadTarget } from "../api";

/**
 * Uploads a file in three steps: request a presigned URL, PUT the bytes straight to storage
 * (with progress), then confirm with the API. Resolves with whatever `target.complete` returns.
 * On failure it shows a toast and rethrows, so callers only need to stop their own flow.
 */
export function useFileUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const uploadFile = async <T>(
    file: File,
    target: UploadTarget<T>,
  ): Promise<T> => {
    setIsUploading(true);
    setProgress(0);

    try {
      const presigned = await target.presign({
        fileName: file.name,
        contentType: file.type,
        size: file.size,
      });

      await putToStorage(presigned.uploadUrl, file, setProgress);

      return await target.complete(presigned);
    } catch (err) {
      console.error("Upload process failed:", err);
      toast.add({
        title: "Upload failed",
        description:
          err instanceof Error && err.message
            ? err.message
            : "Failed to upload file. Please try again.",
        type: "error",
      });
      throw err;
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadFile, isUploading, progress };
}
