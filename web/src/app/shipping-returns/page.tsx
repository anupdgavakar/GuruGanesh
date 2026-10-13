import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";
import { SITE_EMAIL, SITE_PHONE_DISPLAY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Shipping & Returns",
  description: "How long printing and delivery take, and what we do if something is wrong with your order.",
};

export default function ShippingReturnsPage() {
  return (
    <LegalPage
      eyebrow="Shipping & returns"
      title="Shipping & returns"
      intro="How your order gets to you, and what happens if it isn't right."
      updated="12 October 2026"
      sections={[
        {
          heading: "Printing and delivery times",
          body: [
            "Most orders print and ship within 3–5 business days once the design and details are confirmed. Each product shows its delivery option, and larger or special orders can take longer — we will tell you when we confirm your order.",
            "We deliver across India. Delivery times are estimates and can be affected by the courier, weather or local holidays.",
          ],
        },
        {
          heading: "Delivery charges",
          body: ["Any delivery charge is told to you when we confirm your price, before you pay."],
        },
        {
          heading: "Checking your order",
          body: [
            "Please check your parcel when it arrives. If it is damaged or something looks wrong, contact us straight away and keep the packaging and, if possible, a photo.",
          ],
        },
        {
          heading: "If something is wrong",
          body: [
            "If the print quality is poor, the printing does not match the design you approved, the quantity is wrong, or the goods were damaged on the way, tell us and we will reprint the order or refund you.",
            "We cannot reprint or refund for mistakes in the artwork you approved (for example a spelling mistake in your own file), or for small colour differences between a screen and the printed result.",
          ],
        },
        {
          heading: "Cancelling an order",
          body: [
            "You can cancel before printing starts. Because printed items are made specially for you, an order cannot normally be cancelled once printing has begun.",
          ],
        },
        {
          heading: "How to reach us",
          body: [`Call ${SITE_PHONE_DISPLAY} or email ${SITE_EMAIL} with your name, your order details and, if relevant, photos of the problem.`],
        },
      ]}
    />
  );
}
