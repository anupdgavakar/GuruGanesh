import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";
import { SITE_EMAIL, SITE_PHONE_DISPLAY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms for ordering printing and design from GuruGanesh Graphics.",
};

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms"
      title="Terms of Service"
      intro="By placing an order or asking for a quote you agree to these terms. They are written to be short and clear."
      updated="12 October 2026"
      sections={[
        {
          heading: "Orders and prices",
          body: [
            "An order on this website is a request. Our team reviews it, confirms the details and the final price with you, and your order is accepted once we have confirmed it.",
            "Some prices are not shown on the website. For those you ask for a price and we reply with a quote; a quote is based on the product, quantity and details you gave us, and may change if those change.",
            "No payment is taken on the website. We will tell you how and when to pay when we confirm your order.",
          ],
        },
        {
          heading: "Your account",
          body: [
            "You sign in with your mobile number and a one-time code. Please keep your phone secure and give us correct details, because we use them to contact you about your order.",
          ],
        },
        {
          heading: "Artwork and proofs",
          body: [
            "You are responsible for the artwork you send us, and you confirm that you have the right to use it. We may refuse to print anything unlawful, offensive or that infringes someone else's rights.",
            "Please check spelling, phone numbers and colours carefully before approving a design. Colours on a screen can look slightly different from the printed result, and once you approve a design we print it as approved.",
          ],
        },
        {
          heading: "Made-to-order goods",
          body: [
            "Printed items are made specially for you, so they cannot usually be cancelled after printing has started. See Shipping & returns for what we do if something is wrong.",
          ],
        },
        {
          heading: "Delivery",
          body: ["Delivery times we quote are estimates. Details are on the Shipping & returns page."],
        },
        {
          heading: "Our responsibility",
          body: [
            "We take care to print what you approved. If our work is faulty we will put it right as described on the Shipping & returns page. Our responsibility is limited to the value of the order concerned, to the extent the law allows.",
          ],
        },
        {
          heading: "Contact",
          body: [`Questions about these terms: ${SITE_PHONE_DISPLAY} or ${SITE_EMAIL}.`],
        },
      ]}
    />
  );
}
