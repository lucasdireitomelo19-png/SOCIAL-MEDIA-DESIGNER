import "server-only";
import { redirect } from "next/navigation";
import { cache } from "react";
import { getAdminSession } from "./session";

export const verifyAdminSession = cache(async () => {
  const session = await getAdminSession();
  if (!session?.adminId) {
    redirect("/admin/login");
  }
  return session;
});

export const getCurrentAdmin = cache(async () => {
  return getAdminSession();
});
