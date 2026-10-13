import type { Metadata } from "next";
import { LegalPage } from "@/components/sections/legal-page";
import { SITE_EMAIL, SITE_PHONE_DISPLAY } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What personal information GuruGanesh Graphics collects, why, and how you can ask us to change or remove it.",
};

export default function PrivacyPage() {
  return (
    <LegalPage
      eyebrow="Privacy"
      title="Privacy Policy"
      intro="We only collect what we need to quote, print and deliver your order. This page explains what that is and what you can ask us to do about it."
      updated="12 October 2026"
      sections={[
        {
          heading: "What we collect",
          body: [
            "- Your name and mobile number when you sign in, and your email address if you give one.",
            "- Delivery address, company name and GST number when you place an order or ask for a quote.",
            "- The messages you send us through the contact form, and the price requests you make.",
            "- Design files you upload or email to us so we can print them.",
            "- Basic technical information your browser sends to any website (such as your browser type), and the items saved in your cart, which stay in your own browser.",
          ],
        },
        {
          heading: "How we use it",
          body: [
            "- To confirm your order, prepare a price for you and contact you about it.",
            "- To print and deliver what you ordered, and to send you updates about it.",
            "- To check that a sign-in is really you, using a one-time code sent to your mobile number.",
            "- To answer questions you send us and to improve the website.",
            "We do not sell your personal information.",
          ],
        },
        {
          heading: "Who can see it",
          body: [
            "Only our own team can see your orders, messages and design files, and each person sees only the parts of the admin area their role allows. We share your name, phone number and address with a courier only when that is needed to deliver your order, and with a text-message provider only to send you a sign-in code.",
          ],
        },
        {
          heading: "Your design files",
          body: [
            "Artwork you send us is used only to print your order. We do not use it for anything else or show it to other customers.",
          ],
        },
        {
          heading: "Keeping it safe, and for how long",
          body: [
            "We keep your information on our own systems with access limited to our team, and we keep order records for as long as we need them for accounts and for reprints or queries about your order.",
          ],
        },
        {
          heading: "Your choices",
          body: [
            `You can ask us to show you what we hold about you, correct it, or delete it. Call ${SITE_PHONE_DISPLAY} or email ${SITE_EMAIL} and we will deal with it; we may need to keep some order records where the law or our accounts require it.`,
          ],
        },
        {
          heading: "Changes to this page",
          body: ["If we change how we handle your information we will update this page and the date at the top."],
        },
      ]}
    />
  );
}
