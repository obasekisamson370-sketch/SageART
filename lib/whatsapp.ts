/** wa.me wants digits only, no "+" or spaces. */
export function waNumber(): string {
  const raw = process.env.NEXT_PUBLIC_SELLER_WHATSAPP_NUMBER ?? "";
  return raw.replace(/[^\d]/g, "");
}

export function waLink(text: string): string {
  return `https://wa.me/${waNumber()}?text=${encodeURIComponent(text)}`;
}
