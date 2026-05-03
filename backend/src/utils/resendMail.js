import { Resend } from "resend";

// NOTE: Do NOT construct Resend at module level — dotenv hasn't run yet at import time.
// We create the client lazily inside the function after env vars are available.

/**
 * Sends an email verification link to a newly registered user.
 * @param {object} opts
 * @param {string} opts.to        - Recipient email address
 * @param {string} opts.name      - Recipient display name
 * @param {string} opts.verifyUrl - Full verification URL with token
 */
const sendVerificationEmail = async ({ to, name, verifyUrl }) => {
  // Create client lazily here — dotenv is guaranteed to have run by the time this is called
  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    await resend.emails.send({
      from: "YouTube Summarizer <onboarding@resend.dev>",
      to,
      subject: "Verify your email — YouTube Summarizer",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #7c3aed;">Welcome to YouTube Summarizer, ${name}!</h2>
          <p>Thanks for signing up. Please verify your email address to activate your account.</p>
          <a
            href="${verifyUrl}"
            style="
              display: inline-block;
              padding: 12px 24px;
              background-color: #7c3aed;
              color: #ffffff;
              text-decoration: none;
              border-radius: 6px;
              margin: 16px 0;
            "
          >
            Verify Email
          </a>
          <p style="color: #6b7280; font-size: 14px;">
            This link expires in <strong>24 hours</strong>. If you didn't sign up, you can safely ignore this email.
          </p>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send verification email:", error.message);
    throw new Error("Email delivery failed. Please try again later.");
  }
};

export { sendVerificationEmail };
