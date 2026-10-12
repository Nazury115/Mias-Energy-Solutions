export type ContactDetails = {
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
};

export type ContactLink = {
  kind: "phone" | "whatsapp" | "email";
  label: string;
  href: string;
};

/** Only confirmed, well-formed destinations become public actions. */
export function getContactLinks(contacts: ContactDetails, context = ""): ContactLink[] {
  const links: ContactLink[] = [];
  const internationalPhone = /^\+[1-9]\d{7,14}$/;
  const emailAddress = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (contacts.phone && internationalPhone.test(contacts.phone)) {
    links.push({ kind: "phone", label: "Call Mias", href: `tel:${contacts.phone}` });
  }
  if (contacts.whatsapp && internationalPhone.test(contacts.whatsapp)) {
    const message = context ? `?text=${encodeURIComponent(context)}` : "";
    links.push({ kind: "whatsapp", label: "WhatsApp Mias", href: `https://wa.me/${contacts.whatsapp.slice(1)}${message}` });
  }
  if (contacts.email && emailAddress.test(contacts.email)) {
    const subject = context ? `?subject=${encodeURIComponent(context)}` : "";
    links.push({ kind: "email", label: "Email Mias", href: `mailto:${contacts.email}${subject}` });
  }
  return links;
}
