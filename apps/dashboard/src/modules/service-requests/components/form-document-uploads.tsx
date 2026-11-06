import type { DocumentType } from "@journeyhome/schemas";
import { type Control, useController } from "react-hook-form";
import type { ServiceRequestFormValues } from "@/modules/service-requests/service-request-form";
import {
  DOC_ACCEPT,
  DOC_HINT,
  DOC_LABEL,
  DOC_MAX_BYTES,
} from "@/modules/service-requests/service-requests.utils";
import { FileUploadArea } from "@/modules/storage/components/file-upload-area";

type DocField = "Death_Certificate" | "Valid_Identification";

function FormDocumentUpload({
  control,
  type,
  uploaded,
  isUploading,
  progress,
  disabled,
}: {
  control: Control<ServiceRequestFormValues>;
  type: DocField;
  uploaded: boolean;
  isUploading: boolean;
  progress: number;
  disabled: boolean;
}) {
  const { field, fieldState } = useController({
    control,
    name: `documents.${type}`,
  });
  return (
    <FileUploadArea
      label={DOC_LABEL[type]}
      accept={DOC_ACCEPT}
      maxSize={DOC_MAX_BYTES}
      hint={DOC_HINT}
      value={field.value}
      error={fieldState.error?.message}
      uploaded={uploaded}
      isUploading={isUploading}
      progress={progress}
      disabled={disabled}
      onChange={(file) => field.onChange(file ?? undefined)}
    />
  );
}

/** One upload area per required document, bound to the form's `documents` field. */
export function FormDocumentUploads({
  control,
  uploaded,
  uploadingType,
  progress,
  disabled,
}: {
  control: Control<ServiceRequestFormValues>;
  uploaded: DocumentType[];
  uploadingType: DocumentType | null;
  progress: number;
  disabled: boolean;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {(["Death_Certificate", "Valid_Identification"] as const).map((type) => (
        <FormDocumentUpload
          key={type}
          control={control}
          type={type}
          uploaded={uploaded.includes(type)}
          isUploading={uploadingType === type}
          progress={progress}
          disabled={disabled}
        />
      ))}
    </div>
  );
}
