export const inquiryServices = {
  general: "General inquiry", water: "Water solutions", electrical: "Electrical solutions",
  "renewable-energy": "Renewable energy", "solar-water-pumping": "Solar water pumping", repairs: "Repairs & support",
} as const;
export type InquiryInput = { name: string; service: string; area: string; message: string };
export type InquiryErrors = Partial<Record<keyof InquiryInput, string>>;
export type InquiryResult = { ok: false; errors: InquiryErrors } | { ok: true; message: string };

export function prepareInquiry(input: InquiryInput): InquiryResult {
  const name = input.name.trim(), area = input.area.trim(), message = input.message.trim();
  const errors: InquiryErrors = {};
  if (!name) errors.name = "Enter your name.";
  else if (name.length > 80) errors.name = "Use 80 characters or fewer for your name.";
  if (!Object.hasOwn(inquiryServices, input.service)) errors.service = "Choose a listed service.";
  if (area.length > 120) errors.area = "Use 120 characters or fewer for the area.";
  if (!message) errors.message = "Describe the help you need.";
  else if (message.length > 1500) errors.message = "Use 1,500 characters or fewer for the project details.";
  if (Object.keys(errors).length) return { ok: false, errors };
  return { ok: true, message: ["Hello Mias Energy Solutions,", `My name is ${name}.`,
    `Service: ${inquiryServices[input.service as keyof typeof inquiryServices]}`,
    ...(area ? [`Area: ${area}`] : []), "", message].join("\n") };
}
