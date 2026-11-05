import { Button } from "@journeyhome/ui/components/button";
import { ImageWithSkeleton } from "@journeyhome/ui/components/image-with-skeleton";
import { cn } from "@journeyhome/ui/lib/utils";
import { FileText, UploadCloud, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { type FileRejection, useDropzone } from "react-dropzone";
import { formatBytes } from "@/lib/format";

interface FileUploadProps {
  label: string;
  accept?: Record<string, string[]>;
  /** The chosen file, or a URL for a file that is already stored. */
  value?: File | null | string;
  onChange: (file: File | null) => void;
  error?: string;
  isUploading?: boolean;
  /** 0-100, shown while `isUploading`. */
  progress?: number;
  /** The file is already safely stored: it can't be removed or replaced from here. */
  uploaded?: boolean;
  disabled?: boolean;
  previewUrl?: string | null;
  /** Largest file accepted, in bytes. */
  maxSize?: number;
  /** Shown under the drop prompt, e.g. "JPG, PNG or PDF". */
  hint?: string;
}

function rejectionMessage(
  rejection: FileRejection | undefined,
  maxSize?: number,
  hint?: string,
) {
  const code = rejection?.errors[0]?.code;
  switch (code) {
    case "file-too-large":
      return `That file is over ${formatBytes(maxSize ?? 0)}.`;
    case "file-invalid-type":
      return hint
        ? `Please choose a ${hint} file.`
        : "That file type isn't supported.";
    case "too-many-files":
      return "Please add one file at a time.";
    default:
      return rejection ? "That file couldn't be added." : null;
  }
}

export function FileUploadArea({
  label,
  accept = { "image/*": [], "application/pdf": [] },
  value,
  onChange,
  error,
  isUploading = false,
  progress = 0,
  uploaded = false,
  disabled = false,
  previewUrl,
  maxSize,
  hint,
}: FileUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [previewFailed, setPreviewFailed] = useState(false);
  const [rejected, setRejected] = useState<string | null>(null);

  useEffect(() => {
    setPreviewFailed(false);

    if (previewUrl) {
      setPreview(previewUrl);
      return;
    }

    if (typeof value === "string") {
      setPreview(value);
      return;
    }

    if (value instanceof File && value.type.startsWith("image/")) {
      const objectUrl = URL.createObjectURL(value);
      setPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }

    setPreview(null);
  }, [value, previewUrl]);

  const onDrop = useCallback(
    (acceptedFiles: File[], rejections: FileRejection[]) => {
      const file = acceptedFiles[0];
      if (file) {
        setRejected(null);
        onChange(file);
      } else {
        setRejected(rejectionMessage(rejections[0], maxSize, hint));
      }
    },
    [onChange, maxSize, hint],
  );

  const locked = disabled || isUploading;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    maxFiles: 1,
    multiple: false,
    disabled: locked,
  });

  const message = error ?? rejected;

  const details =
    value instanceof File
      ? {
          name: value.name,
          size: formatBytes(value.size),
          status: uploaded
            ? "Uploaded"
            : isUploading
              ? "Uploading…"
              : "Ready to submit",
        }
      : typeof value === "string" && value
        ? {
            name:
              decodeURIComponent(value.split("/").pop()?.split("?")[0] ?? "") ||
              "Uploaded file",
            size: null,
            status: "Uploaded",
          }
        : null;

  if (details) {
    return (
      <div className="flex flex-col gap-2">
        <span className="text-sm font-medium leading-none">{label}</span>
        <div
          className={cn(
            "flex items-center justify-between rounded-2xl border border-border bg-muted/30 p-3.5 transition-all",
            message && "border-destructive/50 bg-destructive/5",
          )}
        >
          <div className="flex w-full items-center gap-3.5 overflow-hidden">
            <div className="relative flex size-12 min-w-12 items-center justify-center overflow-hidden rounded-xl border border-border bg-background text-primary">
              {isUploading ? (
                <span className="z-10 text-xs font-bold">{progress}%</span>
              ) : preview && !previewFailed ? (
                <ImageWithSkeleton
                  src={preview}
                  alt="Preview"
                  skeletonClassName="bg-muted"
                  className="size-full object-cover"
                  onError={() => setPreviewFailed(true)}
                />
              ) : (
                <FileText className="size-6 text-muted-foreground" />
              )}

              {isUploading && (
                // biome-ignore lint/a11y/noSvgWithoutTitle: decorative progress ring
                <svg
                  className="pointer-events-none absolute inset-0 size-12 -rotate-90"
                  viewBox="0 0 36 36"
                >
                  <path
                    className="text-accent/25"
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                  <path
                    className="text-accent transition-all duration-300 ease-out"
                    strokeDasharray={`${progress}, 100`}
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                  />
                </svg>
              )}
            </div>

            <div className="flex-1 overflow-hidden">
              <p
                className="truncate text-sm font-medium text-foreground"
                title={details.name}
              >
                {details.name}
              </p>
              <p className="text-xs text-muted-foreground">
                {details.size ? `${details.size} • ` : ""}
                {details.status}
              </p>
            </div>

            {!uploaded && (
              <Button
                type="button"
                variant="ghost"
                size="icon"
                aria-label={`Remove ${details.name}`}
                onClick={() => {
                  setRejected(null);
                  onChange(null);
                }}
                disabled={locked}
                className="shrink-0 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <X className="size-4" />
              </Button>
            )}
          </div>
        </div>
        {message && (
          <p role="alert" className="text-xs font-medium text-destructive">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium leading-none">{label}</span>
      <div
        {...getRootProps()}
        className={cn(
          "flex cursor-pointer flex-col items-center gap-2 rounded-2xl border-2 border-dashed p-6 text-center outline-none transition-colors focus-visible:border-accent",
          isDragActive
            ? "border-accent bg-accent/10"
            : "border-border hover:bg-muted/50",
          message && "border-destructive/50 bg-destructive/5",
          locked && "cursor-not-allowed opacity-50",
        )}
      >
        <input {...getInputProps({ "aria-label": label })} />
        <div className="flex size-10 items-center justify-center rounded-full bg-muted">
          <UploadCloud className="size-5 text-muted-foreground" />
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">
            Click to upload{" "}
            <span className="font-normal text-muted-foreground">
              or drag and drop
            </span>
          </p>
          {(hint || maxSize) && (
            <p className="mt-1 text-xs text-muted-foreground">
              {[hint, maxSize && `up to ${formatBytes(maxSize)}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
        </div>
      </div>
      {message && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {message}
        </p>
      )}
    </div>
  );
}
