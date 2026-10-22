const getEnv = (key: string, viteKey: string) => {
  if (typeof import.meta !== "undefined" && import.meta.env && import.meta.env[viteKey]) {
    return import.meta.env[viteKey] as string;
  }
  if (typeof process !== "undefined" && process.env && process.env[key]) {
    return process.env[key] as string;
  }
  return undefined;
};

export const API_URL = getEnv("NEXT_PUBLIC_API_URL", "VITE_API_URL") ?? "http://localhost:3043/api/v1";
export const APP_URL = getEnv("NEXT_PUBLIC_APP_URL", "VITE_APP_URL") ?? "http://localhost:5173";
export const SIGNUP_URL = `${APP_URL}/signup`;
export const LOGIN_URL = `${APP_URL}/login`;
export const CONTACT_EMAIL = "hello@journeyhome.ng";
