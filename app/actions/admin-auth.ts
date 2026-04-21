"use server";

import { redirect } from "next/navigation";

import {
  clearAdminSession,
  isAdminConfigured,
  setAdminSession,
  verifyAdminCredentials,
} from "@/lib/admin-auth";

function getString(formData: FormData, key: string) {
  return String(formData.get(key) ?? "").trim();
}

export async function adminLoginAction(formData: FormData) {
  const username = getString(formData, "username");
  const password = getString(formData, "password");

  if (!isAdminConfigured()) {
    redirect("/login?error=config");
  }

  if (!verifyAdminCredentials(username, password)) {
    redirect("/login?error=invalid");
  }

  await setAdminSession();
  redirect("/");
}

export async function adminLogoutAction() {
  await clearAdminSession();
  redirect("/login");
}
