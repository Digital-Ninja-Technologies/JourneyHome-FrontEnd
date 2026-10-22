import { env } from "#/env/client";

export const API_URL = env.VITE_API_BASE_URL;
export const APP_URL = env.VITE_APP_URL;
export const SITE_ORIGIN = env.VITE_SITE_URL;
export const SIGNUP_URL = `${APP_URL}/signup`;
export const LOGIN_URL = `${APP_URL}/login`;
export const CONTACT_EMAIL = "hello@journeyhome.ng";
