import type {
  AdminPackage,
  CreatePackageInput,
  UpdatePackageInput,
} from "@journeyhome/schemas";
import { toast } from "@journeyhome/ui/components/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createPackage, syncPackageWithPaystack, updatePackage } from "./api";

function useInvalidatePackages() {
  const queryClient = useQueryClient();
  return () => void queryClient.invalidateQueries({ queryKey: ["packages"] });
}

const onError = (title: string) => (error: Error) =>
  toast.add({ type: "error", title, description: error.message });

export function useCreatePackageMutation() {
  const invalidate = useInvalidatePackages();
  return useMutation({
    mutationFn: (body: CreatePackageInput) => createPackage(body),
    onSuccess: (pkg) => {
      invalidate();
      toast.add({
        type: "success",
        title: "Package created",
        description: pkg.name,
      });
    },
    onError: onError("Couldn't create the package"),
  });
}

export function useUpdatePackageMutation() {
  const invalidate = useInvalidatePackages();
  return useMutation({
    mutationFn: ({ id, ...body }: UpdatePackageInput & { id: string }) =>
      updatePackage(id, body),
    onSuccess: (pkg: AdminPackage, vars) => {
      invalidate();
      const toggledOnly = Object.keys(vars).length === 2 && "isActive" in vars;
      toast.add({
        type: "success",
        title: toggledOnly
          ? `${pkg.name} ${pkg.isActive ? "activated" : "deactivated"}`
          : "Package saved",
        description: toggledOnly
          ? undefined
          : "Price changes apply to new plans only.",
      });
    },
    onError: onError("Couldn't save the package"),
  });
}

export function useSyncPackageMutation() {
  const invalidate = useInvalidatePackages();
  return useMutation({
    mutationFn: (id: string) => syncPackageWithPaystack(id),
    onSuccess: (pkg) => {
      invalidate();
      toast.add({
        type: "success",
        title: "Synced with Paystack",
        description: pkg.name,
      });
    },
    onError: onError("Paystack sync failed"),
  });
}
