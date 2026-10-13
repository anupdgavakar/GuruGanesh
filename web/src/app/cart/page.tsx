import type { Metadata } from "next";
import { CartPage } from "@/components/cart/cart-page";
import { getSettings } from "@/lib/api/resources";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review your cart before checking out.",
};

export default async function Page() {
  const settings = await getSettings();
  return <CartPage designSubmissionEmail={settings.design_submission_email} />;
}
