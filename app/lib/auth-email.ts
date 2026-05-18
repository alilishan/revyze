import { Resend } from "resend"
import type { EmailProviderSendVerificationRequestParams as SendVerificationRequestParams } from "@auth/core/providers/email"

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendVerificationRequest({
  identifier,
  url,
  provider,
}: SendVerificationRequestParams) {
  const { host } = new URL(url)
  const from = (provider as { from?: string }).from ?? "noreply@revyze.app"

  const html = buildEmail(url)
  const text = buildPlainText(url)

  const { error } = await resend.emails.send({
    from,
    to: identifier,
    subject: "Sign in to Revyze",
    html,
    text,
  })

  if (error) throw new Error(`Failed to send sign-in email: ${error.message}`)
}

function buildEmail(url: string) {
  return /* html */ `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sign in to Revyze</title>
</head>
<body style="margin:0;padding:0;background:#eef2ff;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;">

          <!-- Wordmark -->
          <tr>
            <td align="center" style="padding-bottom:24px;">
              <span style="font-size:22px;font-weight:700;letter-spacing:-0.5px;">
                <span style="color:#1e293b;">REVY</span><span style="color:#4f46e5;">ZE</span>
              </span>
            </td>
          </tr>

          <!-- Card -->
          <tr>
            <td style="background:#ffffff;border-radius:16px;padding:40px 36px;box-shadow:0 1px 3px rgba(0,0,0,.08);">

              <!-- Heading -->
              <p style="margin:0 0 8px;font-size:22px;font-weight:700;color:#0f172a;text-align:center;">
                Your sign-in link
              </p>
              <p style="margin:0 0 32px;font-size:15px;color:#64748b;text-align:center;line-height:1.6;">
                Click the button below to sign in to your Revyze account.
                This link is valid for <strong style="color:#334155;">10 minutes</strong> and can only be used once.
              </p>

              <!-- CTA button -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center">
                    <a href="${url}"
                       style="display:inline-block;background:#4f46e5;color:#ffffff;text-decoration:none;font-size:15px;font-weight:600;padding:14px 36px;border-radius:10px;letter-spacing:0.01em;">
                      Sign in to Revyze
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Divider -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:32px 0;">
                <tr>
                  <td style="border-top:1px solid #e2e8f0;"></td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin:0 0 8px;font-size:13px;color:#94a3b8;text-align:center;">
                Button not working? Copy and paste this link into your browser:
              </p>
              <p style="margin:0;font-size:12px;color:#6366f1;text-align:center;word-break:break-all;">
                ${url}
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 0 0;text-align:center;">
              <p style="margin:0;font-size:12px;color:#94a3b8;line-height:1.6;">
                If you didn&apos;t request this email, you can safely ignore it.<br/>
                Your account will not be affected.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>
  `.trim()
}

function buildPlainText(url: string) {
  return `Sign in to Revyze

Click the link below to sign in. This link is valid for 10 minutes and can only be used once.

${url}

If you didn't request this email, you can safely ignore it.
`.trim()
}
