import { Resend } from "resend";

const DEFAULT_FROM = "BuildrHQ Hiring <noreply@coderzai.xyz>";

function getResend(): Resend {
    if (!process.env.RESEND_API_KEY) {
        throw new Error("RESEND_API_KEY environment variable is not set");
    }
    return new Resend(process.env.RESEND_API_KEY);
}

function fromEmail(): string {
    return process.env.RESEND_FROM_EMAIL || DEFAULT_FROM;
}

function appUrl(): string {
    return (
        process.env.NEXT_PUBLIC_HIRING_URL ||
        process.env.NEXTAUTH_URL ||
        "http://localhost:3002"
    );
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
          <p style="margin:0;font-size:20px;font-weight:700;color:#111111;letter-spacing:-0.3px;">BuildrHQ Hiring</p>
          ${params.subtitle ? `<p style="margin:6px 0 0;font-size:13px;color:#737373;">${params.subtitle}</p>` : ""}
        </div>

        <div style="padding:28px;">
          ${params.body}
        </div>

      </div>

      <p style="margin:12px 2px 0;font-size:12px;color:#737373;line-height:1.6;">
        ${params.footerNote ?? "This is an automated message from BuildrHQ Hiring. Please do not reply directly to this email."}
      </p>
      <p style="margin:4px 2px 0;font-size:12px;color:#a3a3a3;">© ${year} BuildrHQ. All rights reserved.</p>
    </div>
  </body>
</html>`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export const hiringEmailTemplates = {

    verifyOTP: (name: string, otp: string) => ({
        subject: "Verify your email — BuildrHQ Hiring",
        html: shell({
            title: "Verify your email",
            subtitle: "Use this one-time code to complete your registration",
            body: `
        <p style="margin:0 0 14px;font-size:15px;color:#111111;">Hello ${name},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#525252;">
          Enter the code below to verify your email and activate your hiring workspace.
          This code expires in <strong>10 minutes</strong>.
        </p>

        <div style="margin:24px 0;padding:20px 16px;border:1px solid #d4d4d4;border-radius:12px;background:#fafafa;text-align:center;">
          <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.1em;color:#737373;text-transform:uppercase;">Verification code</p>
          <p style="margin:0;font-size:38px;letter-spacing:10px;font-weight:700;color:#111111;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,'Courier New',monospace;">${otp}</p>
        </div>

        <p style="margin:0;font-size:13px;color:#737373;">
          If you did not create an account, you can safely ignore this email.
        </p>
      `,
        }),
    }),

    resetPasswordOTP: (name: string, otp: string) => ({
        subject: "Reset your password — BuildrHQ Hiring",
        html: shell({
            title: "Password reset request",
            subtitle: "Use this code to reset your password",
            body: `
        <p style="margin:0 0 14px;font-size:15px;color:#111111;">Hello ${name},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#525252;">
          We received a request to reset your password. Use the code below on the reset page.
          This code expires in <strong>10 minutes</strong>.
        </p>

        <div style="margin:24px 0;padding:20px 16px;border:1px solid #d4d4d4;border-radius:12px;background:#fafafa;text-align:center;">
          <p style="margin:0 0 10px;font-size:11px;letter-spacing:0.1em;color:#737373;text-transform:uppercase;">Password reset code</p>
          <p style="margin:0;font-size:38px;letter-spacing:10px;font-weight:700;color:#111111;font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,'Courier New',monospace;">${otp}</p>
        </div>

        <div style="margin:16px 0;padding:14px;border:1px solid #e5e5e5;border-radius:8px;background:#fafafa;font-size:13px;color:#525252;">
          If you did not request a password reset, you can ignore this email — your password will not change.
        </div>
      `,
        }),
    }),

    companyWelcome: (name: string, companyName: string) => ({
        subject: "Your hiring workspace is ready — BuildrHQ",
        html: shell({
            title: "Workspace ready",
            subtitle: `${companyName} is now active on BuildrHQ Hiring`,
            body: `
        <p style="margin:0 0 14px;font-size:15px;color:#111111;">Hello ${name},</p>
        <p style="margin:0 0 18px;font-size:14px;color:#525252;">
          Your company workspace for <strong>${companyName}</strong> is now active.
          You're ready to start finding exceptional engineering talent.
        </p>

        <div style="margin:20px 0;padding:16px;border:1px solid #e5e5e5;border-radius:10px;background:#fafafa;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#111111;">What's available</p>
          <ul style="margin:0;padding-left:18px;color:#525252;font-size:13px;line-height:1.8;">
            <li>Access to pre-vetted developer candidates</li>
            <li>AI-powered candidate matching and scoring</li>
            <li>Automated technical assessments</li>
            <li>Team collaboration and pipeline tools</li>
          </ul>
        </div>

        <p style="text-align:center;margin:24px 0 8px;">
          <a href="${appUrl()}/home"
             style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;">
            Open dashboard
          </a>
        </p>
      `,
        }),
    }),

    memberInvitation: (
        inviterName: string,
        role: string,
        companyName: string,
        inviteUrl: string,
        message?: string,
    ) => ({
        subject: `You've been invited to join ${companyName} — BuildrHQ Hiring`,
        html: shell({
            title: `Invitation to ${companyName}`,
            subtitle: "You've been invited to join a hiring team",
            body: `
        <p style="margin:0 0 14px;font-size:15px;color:#111111;">Hello,</p>
        <p style="margin:0 0 18px;font-size:14px;color:#525252;">
          <strong>${inviterName}</strong> has invited you to join <strong>${companyName}</strong> as a <strong>${role}</strong> on BuildrHQ Hiring.
        </p>

        ${message ? `
        <div style="margin:16px 0;padding:14px;border-left:3px solid #d4d4d4;background:#fafafa;border-radius:0 8px 8px 0;">
          <p style="margin:0 0 4px;font-size:11px;color:#737373;text-transform:uppercase;letter-spacing:0.08em;">Personal message</p>
          <p style="margin:0;font-size:13px;color:#404040;">"${message}"</p>
        </div>` : ""}

        <div style="margin:20px 0;padding:16px;border:1px solid #e5e5e5;border-radius:10px;background:#fafafa;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#111111;">What you'll have access to</p>
          <ul style="margin:0;padding-left:18px;color:#525252;font-size:13px;line-height:1.8;">
            <li>Candidate pipeline and review tools</li>
            <li>Team collaboration workspace</li>
            <li>AI-powered assessments and matching</li>
          </ul>
        </div>

        <p style="text-align:center;margin:24px 0;">
          <a href="${inviteUrl}"
             style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;">
            Accept invitation
          </a>
        </p>

        <div style="margin:16px 0;padding:14px;border:1px solid #e5e5e5;border-radius:8px;background:#fafafa;font-size:13px;color:#525252;">
          This invitation expires in 7 days. If you were not expecting this, you can safely ignore this email.
        </div>

        <p style="margin:0 0 8px;font-size:13px;color:#525252;">If the button does not work, copy and paste this URL:</p>
        <p style="margin:0;padding:10px;border:1px solid #e5e5e5;border-radius:8px;background:#fafafa;word-break:break-all;font-family:ui-monospace,monospace;font-size:12px;color:#404040;">
          ${inviteUrl}
        </p>
      `,
        }),
    }),

};

// ─── Sender ───────────────────────────────────────────────────────────────────

export type HiringEmailType =
    | "VERIFY_OTP"
    | "RESET_PASSWORD_OTP"
    | "COMPANY_WELCOME"
    | "MEMBER_INVITATION";

export interface SendHiringEmailParams {
    name?: string;
    email: string;
    emailType: HiringEmailType;
    otp?: string;
    companyName?: string;
    inviterName?: string;
    inviteUrl?: string;
    message?: string;
}

export async function sendHiringEmail({
    name,
    email,
    emailType,
    otp,
    companyName,
    inviterName,
    inviteUrl,
    message,
}: SendHiringEmailParams) {
    const displayName = name || "there";
    let template: { subject: string; html: string };

    switch (emailType) {
        case "VERIFY_OTP": {
            if (!otp) throw new Error("otp is required for VERIFY_OTP");
            template = hiringEmailTemplates.verifyOTP(displayName, otp);
            break;
        }
        case "RESET_PASSWORD_OTP": {
            if (!otp) throw new Error("otp is required for RESET_PASSWORD_OTP");
            template = hiringEmailTemplates.resetPasswordOTP(displayName, otp);
            break;
        }
        case "COMPANY_WELCOME": {
            template = hiringEmailTemplates.companyWelcome(displayName, companyName || "Your Company");
            break;
        }
        case "MEMBER_INVITATION": {
            if (!inviteUrl) throw new Error("inviteUrl is required for MEMBER_INVITATION");
            template = hiringEmailTemplates.memberInvitation(
                inviterName || "A team member",
                name || "team member",
                companyName || "the company",
                inviteUrl,
                message,
            );
            break;
        }
        default:
            throw new Error(`Unknown emailType: ${emailType}`);
    }

    const result = await getResend().emails.send({
        from: fromEmail(),
        to: email,
        subject: template.subject,
        html: template.html,
    });

    if (result.error) {
        console.error("Failed to send hiring email:", result.error);
        throw new Error(result.error.message);
    }

    console.log("Hiring email sent successfully:", result.data?.id);
    return result;
}
