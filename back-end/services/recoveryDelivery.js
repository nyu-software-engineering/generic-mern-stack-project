const brevoEndpoint = "https://api.brevo.com/v3/smtp/email";
const deliveryTimeout = 10_000;
const mailboxPart = /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+$/i;
const domainLabel = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;

function validSenderAddress(address) {
  if (typeof address !== "string" || address.length > 254) return false;
  const [mailbox, domain, extra] = address.split("@");
  return extra === undefined && mailbox.length <= 64 && mailbox.split(".").every((part) => mailboxPart.test(part)) &&
    domain?.includes(".") && domain.split(".").every((label) => domainLabel.test(label));
}

export function createBrevoDelivery({ apiKey, from, fromName, fetchImpl = globalThis.fetch }) {
  if (typeof apiKey !== "string" || !/^[!-~]+$/.test(apiKey) || !validSenderAddress(from) ||
      typeof fromName !== "string" || !fromName.trim() || /[\p{Cc}\p{Zl}\p{Zp}]/u.test(fromName)) {
    throw new TypeError("Invalid Brevo sender configuration.");
  }
  const sender = { email: from, name: fromName.trim() };

  return async function deliver({ kind, to, code, expiresAt }) {
    let subject;
    let textContent;
    if (kind === "password-reset") {
      subject = "Your DormShare password reset code";
      textContent = `Your DormShare password reset code is ${code}. It expires at ${new Date(expiresAt).toUTCString()}.

If you did not request a password reset, you can ignore this email.`;
    } else if (kind === "password-changed") {
      subject = "Your DormShare password changed";
      textContent = "Your DormShare password was changed. If you did not make this change, request a password reset from the DormShare login page.";
    } else {
      throw new TypeError("Invalid recovery message.");
    }

    const signal = AbortSignal.timeout(deliveryTimeout);
    let response;
    try {
      response = await fetchImpl(brevoEndpoint, {
        method: "POST",
        headers: {
          "api-key": apiKey,
          "content-type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify({ sender, to: [{ email: to }], subject, textContent }),
        redirect: "error",
        signal,
      });
    } catch {
      throw new Error(signal.aborted ? "Brevo delivery timed out." : "Brevo delivery request failed.");
    }

    void response.body?.cancel().catch(() => {});
    if (!response.ok) throw new Error("Brevo delivery rejected.");
  };
}
