import type { Metadata } from "next";
import { CheckoutForm } from "@/components/cart/checkout-form";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your order — no online payment required.",
};

export default function Page() {
  return <CheckoutForm />;
}
