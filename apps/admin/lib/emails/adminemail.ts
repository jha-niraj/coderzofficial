import { Resend } from "resend";

const DEFAULT_FROM = "BuildrHQ Admin <noreply@coderzai.xyz>";

function getResend(): Resend {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY environment variable is not set");
    }
    return new Resend(process.env.RESEND_API_KEY);
}

function fromEmail(): string {
    return process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
}

// ─── Shell ────────────────────────────────────────────────────────────────────

function shell(params: {
    title: string;
    subtitle?: string;
    body: string;
    footerNote?: string;
}): string {
    const year = new Date().getFullYear();
    return `
<!DOCTYPE html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${params.title}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5f5f5;font-family:Inter,'Segoe UI',Roboto,Arial,sans-serif;color:#171717;">
    <div style="max-width:620px;margin:0 auto;padding:24px 16px;">
      <div style="background:#ffffff;border:1px solid #e5e5e5;border-radius:14px;overflow:hidden;">

        <div style="padding:24px 28px 16px;border-bottom:1px solid #efefef;">
          <p style="margin:0;font-size:20px;font-weight:700;color:#111111;letter-spacing:-0.3px;">BuildrHQ</p>
          ${params.subtitle ? `<p style="margin:6px 0 0;font-size:13px;color:#737373;">${params.subtitle}</p>` : ""}
        </div>

        <div style="padding:28px;">
          ${params.body}
        </div>

      </div>

      <p style="margin:12px 2px 0;font-size:12px;color:#737373;line-height:1.6;">
        ${params.footerNote ?? "This message was sent by the BuildrHQ admin team. Please do not reply directly to this email."}
      </p>
      <p style="margin:4px 2px 0;font-size:12px;color:#a3a3a3;">© ${year} BuildrHQ. All rights reserved.</p>
    </div>
  </body>
</html>`;
}

// ─── Sender ───────────────────────────────────────────────────────────────────

export async function adminSendEmail({
    to,
    subject,
    text,
}: {
    to: string;
    subject: string;
    text: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const html = shell({
            title: subject,
            body: `<p style="margin:0;font-size:14px;color:#525252;line-height:1.7;white-space:pre-wrap;">${text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")}</p>`,
        });

        const result = await getResend().emails.send({
            from: fromEmail(),
            to,
            subject,
            html,
        });

        if (result.error) {
            return { success: false, error: result.error.message || "Failed to send email" };
        }
        return { success: true };
    } catch (err) {
        const message = err instanceof Error ? err.message : "Failed to send email"
        return { success: false, error: message };
    }
}
