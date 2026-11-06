import { MOCK_STORAGE_ORIGIN } from "@/lib/api/mocks";
/** A presigned upload handed out by the API (`.../upload-url` endpoints). */
export interface PresignedUpload {
  fileId: string;
  uploadUrl: string;
  uploadToken: string;
}

export interface UploadFileMeta {
  fileName: string;
  contentType: string;
  size: number;
}

/**
 * Describes where a file is going. The storage hook is generic; each feature supplies the two API
 * calls that bracket the direct-to-storage PUT, so the same flow serves any endpoint.
 */
export interface UploadTarget<T> {
  /** Ask the API for a presigned PUT URL for this file. */
  presign: (file: UploadFileMeta) => Promise<PresignedUpload>;
  /** Confirm the upload with the API once the bytes are in storage. */
  complete: (upload: PresignedUpload) => Promise<T>;
}

/** PUTs the file straight to the presigned URL, reporting progress as a 0-100 percentage. */
export function putToStorage(
  uploadUrl: string,
  file: File,
  onProgress?: (percent: number) => void,
) {
  // Mock mode hands out fake presigned URLs; there's nothing to PUT to.
  if (uploadUrl.startsWith(MOCK_STORAGE_ORIGIN)) {
    onProgress?.(100);
    return Promise.resolve();
  }
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable) {
        onProgress?.(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve();
      else
        reject(
          new Error(
            `Couldn't upload ${file.name} (storage returned ${xhr.status}).`,
          ),
        );
    };
    xhr.onerror = () =>
      reject(
        new Error(
          `Couldn't upload ${file.name}. Check your connection and try again.`,
        ),
      );

    xhr.open("PUT", uploadUrl);
    xhr.setRequestHeader("Content-Type", file.type);
    xhr.send(file);
  });
}
