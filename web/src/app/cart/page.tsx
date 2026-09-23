import type { Metadata } from "next";
import { CartPage } from "@/components/cart/cart-page";

export const metadata: Metadata = {
  title: "Your cart",
  description: "Review your cart before checking out.",
};

export default function Page() {
  return <CartPage />;
}
