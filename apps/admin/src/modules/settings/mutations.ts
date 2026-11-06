import type { AdminMe } from "@journeyhome/schemas";
import { toast } from "@journeyhome/ui/components/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { meQueryOptions } from "@/modules/auth/query-options";
import {
  type AdminPreferences,
  revokeOtherSessions,
  updatePreferences,
} from "./api";
import { explainError } from "./settings.utils";

/** Optimistic: the switch flips at once and rolls back if saving fails. */
export function useUpdatePreferencesMutation() {
  const queryClient = useQueryClient();
  const key = meQueryOptions().queryKey;

  return useMutation({
    mutationFn: (patch: Partial<AdminPreferences>) => updatePreferences(patch),
    onMutate: async (patch) => {
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<AdminMe>(key);
      queryClient.setQueryData<AdminMe>(key, (me) =>
        me
          ? {
              ...me,
              preferences: {
                ...(me.preferences as AdminPreferences),
                ...patch,
              },
            }
          : me,
      );
      return { previous };
    },
    onError: (error, _patch, ctx) => {
      queryClient.setQueryData(key, ctx?.previous);
      toast.add({
        type: "error",
        title: "Preference not saved",
        description: explainError(error),
      });
    },
    onSettled: () => void queryClient.invalidateQueries({ queryKey: key }),
  });
}

export function useRevokeSessionsMutation() {
  return useMutation({
    mutationFn: () => revokeOtherSessions(),
    onSuccess: (res) =>
      toast.add({
        type: "success",
        title: "Other sessions signed out",
        description: res?.revoked
          ? `${res.revoked} sessions ended.`
          : undefined,
      }),
    onError: (error) =>
      toast.add({
        type: "error",
        title: "Couldn't revoke sessions",
        description: explainError(error),
      }),
  });
}
