import {
  type AdminUser,
  adminUserSchema,
  type CreateAdminInput,
} from "@journeyhome/schemas";
import { z } from "zod";
import { api, parseApiResponse } from "@/lib/api";

/** Super admin only. Returns a plain array (not paginated). */
export async function fetchAdmins(): Promise<AdminUser[]> {
  const res = await api<unknown>("/auth/admins");
  return parseApiResponse(
    z.array(adminUserSchema),
    res,
    "Invalid admins response from server",
  );
}

export async function createAdmin(body: CreateAdminInput): Promise<AdminUser> {
  const res = await api<unknown>("/auth/admin", {
    method: "POST",
    body: {
      name: body.name.trim(),
      email: body.email.trim(),
      password: body.password,
    },
  });
  return parseApiResponse(
    adminUserSchema,
    res,
    "Invalid admin response from server",
  );
}

export async function deleteAdmin(
  id: string,
): Promise<{ id: string; email: string }> {
  const res = await api<unknown>(`/auth/admin/${id}`, { method: "DELETE" });
  return parseApiResponse(
    z.object({ id: z.string(), email: z.string() }),
    res,
    "Invalid delete response from server",
  );
}
