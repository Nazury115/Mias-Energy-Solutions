export type OutgoingEmail = { to: string; replyTo: string | null; subject: string; body: string; idempotencyKey?: string };
export type MailTransport = { name: string; send(email: OutgoingEmail): Promise<void> };

// Development inbox: nothing leaves the computer. The stored notification row is the delivered message,
// readable at /dev/inbox. A real email service (chosen in increment 012) is added here as another transport.
const developmentInbox: MailTransport = { name: "dev-inbox", async send() {} };

export function getTransport(): MailTransport {
  const choice = process.env.MIAS_EMAIL_TRANSPORT ?? "dev-inbox";
  if (choice === "dev-inbox") return developmentInbox;
  throw new Error("Email transport is not set up yet.");
}
