import { cookies } from "next/headers";

const SESSION_COOKIE = "meta_admin_session";

function getEnv(name: string) {
  return process.env[name]?.trim() ?? "";
}

function getSessionSecret() {
  return getEnv("ADMIN_SESSION_SECRET") || "change_me_meta_admin_secret";
}

function buildSessionValue(username: string) {
  return `${username}.${getSessionSecret()}`;
}

export function getAdminUsername() {
  return getEnv("ADMIN_USERNAME");
}

export function getAdminPassword() {
  return getEnv("ADMIN_PASSWORD");
}

export function isAdminConfigured() {
  return Boolean(getAdminUsername() && getAdminPassword() && getEnv("ADMIN_SESSION_SECRET"));
}

export function verifyAdminCredentials(username: string, password: string) {
  return username === getAdminUsername() && password === getAdminPassword();
}

export function createAdminSessionValue() {
  return buildSessionValue(getAdminUsername());
}

export function isValidAdminSessionValue(value?: string) {
  if (!value) {
    return false;
  }

  return value === buildSessionValue(getAdminUsername());
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();
  return isValidAdminSessionValue(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function setAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE, createAdminSessionValue(), {
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 14,
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export const adminSessionCookieName = SESSION_COOKIE;
