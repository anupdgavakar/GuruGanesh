"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { adminApiFetch } from "@/lib/api/client";
import type { OrderStatus } from "@/lib/api/types";

export async function updateOrderStatusAction(id: number, status: OrderStatus): Promise<void> {
  await adminApiFetch(`/api/orders/${id}`, {
    method: "PATCH",
    body: { status },
  });
  revalidatePath("/orders");
  revalidatePath(`/orders/${id}`);
}

export async function deleteOrderAction(id: number): Promise<void> {
  await adminApiFetch(`/api/orders/${id}`, { method: "DELETE" });
  revalidatePath("/orders");
  redirect("/orders");
}
