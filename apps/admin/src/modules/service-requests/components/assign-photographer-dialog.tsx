import { zodResolver } from "@hookform/resolvers/zod";
import {
  type AssignPhotographerInput,
  assignPhotographerSchema,
} from "@journeyhome/schemas";
import { FormInput } from "@journeyhome/ui/components/form-fields";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormDialog } from "@/components/form-dialog";
import { useAssignPhotographerMutation } from "../mutations";

const FORM_ID = "assign-photographer-form";
const EMPTY: AssignPhotographerInput = {
  photographerName: "",
  photographerPhoneNo: "",
};

export function AssignPhotographerDialog({
  requestId,
  open,
  onOpenChange,
}: {
  requestId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const assign = useAssignPhotographerMutation(requestId);
  const { control, handleSubmit, reset } = useForm<AssignPhotographerInput>({
    resolver: zodResolver(assignPhotographerSchema),
    defaultValues: EMPTY,
  });

  useEffect(() => {
    if (!open) reset(EMPTY);
  }, [open, reset]);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Assign a photographer"
      description="This books the photographer, closes the request, and notifies the customer."
      formId={FORM_ID}
      submitLabel="Assign and close"
      pendingLabel="Assigning…"
      isPending={assign.isPending}
    >
      <form
        id={FORM_ID}
        noValidate
        className="flex flex-col gap-4"
        onSubmit={handleSubmit((values) =>
          assign.mutate(values, { onSuccess: () => onOpenChange(false) }),
        )}
      >
        <FormInput
          control={control}
          name="photographerName"
          label="Photographer's full name"
          placeholder="e.g. Femi Bello"
          autoComplete="off"
        />
        <FormInput
          control={control}
          name="photographerPhoneNo"
          label="Photographer's phone number"
          placeholder="e.g. 0803 000 0000"
          type="tel"
          inputMode="tel"
          autoComplete="off"
        />
      </form>
    </FormDialog>
  );
}
