"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApiFetch } from "@/lib/api/client";
import type { InquiryStatus } from "@/lib/api/types";

export async function updateInquiryStatusAction(id: number, status: InquiryStatus): Promise<void> {
  await adminApiFetch(`/api/inquiries/${id}`, {
    method: "PATCH",
    body: { status },
  });
  revalidatePath("/inquiries");
  revalidatePath(`/inquiries/${id}`);
}

export async function deleteInquiryAction(id: number): Promise<void> {
  await adminApiFetch(`/api/inquiries/${id}`, { method: "DELETE" });
  revalidatePath("/inquiries");
  redirect("/inquiries");
}
