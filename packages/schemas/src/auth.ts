import { z } from "zod";
import { UserRoleEnum } from "./enums";

export const sessionUserSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  name: z.string().min(1),
  role: UserRoleEnum,
  isSuperAdmin: z.boolean(),
});
export type SessionUser = z.infer<typeof sessionUserSchema>;

export const sessionSchema = z.object({
  user: sessionUserSchema,
  token: z.string(),
  remember: z.boolean().optional(),
});
export type Session = z.infer<typeof sessionSchema>;

export const loginSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
  remember: z.boolean().optional().default(false),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const authLoginResponseSchema = z
  .object({
    user: z
      .object({
        _id: z.string().optional(),
        id: z.string().optional(),
        email: z.string().email(),
        name: z.string(),
        role: z.string().optional(),
        isSuperAdmin: z.boolean().optional(),
      })
      .transform((u) => ({
        id: u.id || u._id || "",
        email: u.email,
        name: u.name,
        role: u.role || "customer",
        isSuperAdmin: Boolean(u.isSuperAdmin),
      })),
    accessToken: z.string().optional(),
    token: z.string().optional(),
  })
  .transform((data) => ({
    user: data.user,
    token: data.accessToken || data.token || "",
  }));
export type AuthLoginResponse = z.infer<typeof authLoginResponseSchema>;

export const adminLoginSchema = z.object({
  email: z.string().trim().email("Please enter your work email"),
  password: z.string().min(1, "Password is required"),
});
export type AdminLoginInput = z.infer<typeof adminLoginSchema>;

export const signupSchema = z.object({
  name: z.string().trim().min(2, "Full name must be at least 2 characters"),
  email: z.string().trim().email("Please enter a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum(["customer", "covered_person"]).default("customer"),
});
export type SignupInput = z.infer<typeof signupSchema>;

export const verifyEmailSchema = z.object({
  token: z.string().min(1, "Verification token is required"),
});
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;

export const resendVerificationSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});
export type ResendVerificationInput = z.infer<typeof resendVerificationSchema>;

export const forgotPasswordSchema = z.object({
  email: z.string().trim().email("Please enter a valid email address"),
});
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z.object({
  token: z.string().min(1, "Reset token is required"),
  newPassword: z.string().min(6, "New password must be at least 6 characters"),
});
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;

export const deleteAccountSchema = z.object({
  password: z.string().min(1, "Password is required to delete account"),
});
export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>;

export const verifyCodeSchema = z.object({
  code: z
    .string()
    .trim()
    .length(6, "Verification code must be exactly 6 digits")
    .regex(/^\d+$/, "Verification code must contain digits only"),
});
export type VerifyCodeInput = z.infer<typeof verifyCodeSchema>;
