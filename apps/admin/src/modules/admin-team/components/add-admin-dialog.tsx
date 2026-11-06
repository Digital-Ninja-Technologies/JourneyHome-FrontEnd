import { zodResolver } from "@hookform/resolvers/zod";
import { type CreateAdminInput, createAdminSchema } from "@journeyhome/schemas";
import { FieldGroup } from "@journeyhome/ui/components/field";
import {
  FormInput,
  FormPasswordInput,
} from "@journeyhome/ui/components/form-fields";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormDialog } from "@/components/form-dialog";
import { useCreateAdminMutation } from "../mutations";

const FORM_ID = "add-admin-form";
const DEFAULTS: CreateAdminInput = { name: "", email: "", password: "" };

export function AddAdminDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const create = useCreateAdminMutation();
  const { control, handleSubmit, reset } = useForm<CreateAdminInput>({
    resolver: zodResolver(createAdminSchema),
    defaultValues: DEFAULTS,
  });

  useEffect(() => {
    if (!open) reset(DEFAULTS);
  }, [open, reset]);

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Add an admin"
      description="They'll sign in with this temporary password. Ask them to change it straight away."
      formId={FORM_ID}
      submitLabel="Add admin"
      pendingLabel="Adding…"
      isPending={create.isPending}
    >
      <form
        id={FORM_ID}
        noValidate
        onSubmit={handleSubmit((values) =>
          create.mutate(values, { onSuccess: () => onOpenChange(false) }),
        )}
      >
        <FieldGroup className="gap-4">
          <FormInput
            control={control}
            name="name"
            label="Full name"
            autoComplete="off"
          />
          <FormInput
            control={control}
            name="email"
            type="email"
            label="Work email"
            autoComplete="off"
            placeholder="name@journeyhome.ng"
          />
          <FormPasswordInput
            control={control}
            name="password"
            label="Temporary password"
            autoComplete="new-password"
            description="At least 6 characters."
          />
        </FieldGroup>
      </form>
    </FormDialog>
  );
}
