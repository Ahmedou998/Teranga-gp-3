import nodemailer from "nodemailer";

const emailEnvKeys = ["SMTP_HOST", "SMTP_PORT", "SMTP_USER", "SMTP_PASSWORD", "SMTP_FROM"];

export function isEmailConfigured() {
  const configured = emailEnvKeys.every((key) => Boolean(process.env[key]?.trim()));
  const port = Number(process.env.SMTP_PORT);
  return configured && Number.isInteger(port) && port > 0 && port <= 65535;
}

function requiredEnv(name: string) {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`Missing required email configuration: ${name}`);
  return value;
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    "\"": "&quot;",
    "'": "&#39;",
  })[character] ?? character);
}

export async function sendAccountEmail(to: string, subject: string, url: string) {
  const host = requiredEnv("SMTP_HOST");
  const port = Number(requiredEnv("SMTP_PORT"));
  const user = requiredEnv("SMTP_USER");
  const password = requiredEnv("SMTP_PASSWORD");
  const from = requiredEnv("SMTP_FROM");

  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT must be a valid TCP port.");
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    requireTLS: port !== 465,
    auth: { user, pass: password },
  });

  const safeUrl = escapeHtml(url);
  await transporter.sendMail({
    from,
    to,
    subject,
    text: `${subject}\n\nOuvrez ce lien pour continuer : ${url}\n\nSi vous n'êtes pas à l'origine de cette demande, ignorez cet email.`,
    html: `<p>${escapeHtml(subject)}</p><p><a href="${safeUrl}">Continuer sur Teranga GP</a></p><p>Si vous n'êtes pas à l'origine de cette demande, ignorez cet email.</p>`,
  });
}
