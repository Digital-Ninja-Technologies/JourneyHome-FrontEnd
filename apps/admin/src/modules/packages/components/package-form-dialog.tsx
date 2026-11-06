import { zodResolver } from "@hookform/resolvers/zod";
import type { AdminPackage } from "@journeyhome/schemas";
import { FieldGroup } from "@journeyhome/ui/components/field";
import {
  FormCheckbox,
  FormInput,
  FormTextarea,
} from "@journeyhome/ui/components/form-fields";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { FormDialog } from "@/components/form-dialog";
import {
  useCreatePackageMutation,
  useUpdatePackageMutation,
} from "../mutations";
import {
  type PackageFormInput,
  type PackageFormValues,
  packageFormDefaults,
  packageFormSchema,
  toPackageBody,
  toPackageFormValues,
} from "../package-form";

const FORM_ID = "package-form";

/** Create when `pkg` is null, edit otherwise. */
export function PackageFormDialog({
  open,
  onOpenChange,
  pkg,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  pkg: AdminPackage | null;
}) {
  const create = useCreatePackageMutation();
  const update = useUpdatePackageMutation();
  const isPending = create.isPending || update.isPending;

  const { control, handleSubmit, reset } = useForm<
    PackageFormInput,
    unknown,
    PackageFormValues
  >({
    resolver: zodResolver(packageFormSchema),
    defaultValues: packageFormDefaults,
  });

  useEffect(() => {
    if (open) reset(pkg ? toPackageFormValues(pkg) : packageFormDefaults);
  }, [open, pkg, reset]);

  const onSubmit = (values: PackageFormValues) => {
    const body = toPackageBody(values);
    const done = { onSuccess: () => onOpenChange(false) };
    if (pkg) update.mutate({ id: pkg._id, ...body }, done);
    else create.mutate(body, done);
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={pkg ? `Edit ${pkg.name}` : "New package"}
      description="Price changes apply to new plans only. Existing plans keep the price they started with."
      formId={FORM_ID}
      submitLabel={pkg ? "Save changes" : "Create package"}
      isPending={isPending}
      className="sm:max-w-xl"
    >
      <form id={FORM_ID} noValidate onSubmit={handleSubmit(onSubmit)}>
        <FieldGroup className="gap-4">
          <FormInput
            control={control}
            name="name"
            label="Name"
            placeholder="e.g. Classic Memorial"
          />
          <FormInput
            control={control}
            name="amount"
            type="number"
            inputMode="decimal"
            min={1}
            step="1"
            label="Monthly contribution (₦)"
            placeholder="10000"
          />
          <FormTextarea
            control={control}
            name="description"
            label="Description"
            rows={2}
            placeholder="What this package covers"
          />
          <FormTextarea
            control={control}
            name="features"
            label="Features"
            description="One per line. Shown to customers when they choose a package."
            rows={4}
            placeholder={"Full-day photography\nDigital gallery"}
          />
          <FormCheckbox
            control={control}
            name="isActive"
            label="Available for new plans"
          />
        </FieldGroup>
      </form>
    </FormDialog>
  );
}
