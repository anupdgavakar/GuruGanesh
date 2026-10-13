/**
 * WhatsApp "click to chat" links. These open WhatsApp (the app, or WhatsApp
 * Web on a computer) with the message already typed — the person sending
 * still presses Send. Nothing is sent automatically.
 */

/** Digits only, with the India country code (91) added to a 10-digit number. */
export function whatsappNumber(phone: string | null | undefined): string | null {
  const digits = (phone ?? "").replace(/\D/g, "").replace(/^0+/, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length >= 11 && digits.length <= 15) return digits;
  return null;
}

/** A link that opens a chat with this number, or null if the number can't be used. */
export function whatsappChatLink(phone: string | null | undefined, text: string): string | null {
  const number = whatsappNumber(phone);
  return number ? `https://wa.me/${number}?text=${encodeURIComponent(text)}` : null;
}

/** A link that opens WhatsApp's own contact picker with the text ready to forward. */
export function whatsappShareLink(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}
