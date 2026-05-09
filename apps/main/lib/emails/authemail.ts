import { Resend } from "resend";

const DEFAULT_FROM = "BuildrHQ <noreply@coderzai.xyz>";

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
		process.env.NEXT_PUBLIC_BASE_URL ||
		process.env.NEXTAUTH_URL ||
		"http://localhost:3000"
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
          <p style="margin:0;font-size:20px;font-weight:700;color:#111111;letter-spacing:-0.3px;">BuildrHQ</p>
          ${params.subtitle ? `<p style="margin:6px 0 0;font-size:13px;color:#737373;">${params.subtitle}</p>` : ""}
        </div>

        <div style="padding:28px;">
          ${params.body}
        </div>

      </div>

      <p style="margin:12px 2px 0;font-size:12px;color:#737373;line-height:1.6;">
        ${params.footerNote ?? "This is an automated message from BuildrHQ. Please do not reply directly to this email."}
      </p>
      <p style="margin:4px 2px 0;font-size:12px;color:#a3a3a3;">© ${year} BuildrHQ. All rights reserved.</p>
    </div>
  </body>
</html>`;
}

// ─── Templates ────────────────────────────────────────────────────────────────

export const authEmailTemplates = {

	verifyOTP: (name: string, otp: string) => ({
		subject: "Verify your email — BuildrHQ",
		html: shell({
			title: "Verify your email",
			subtitle: "Use this one-time code to complete your registration",
			body: `
        <p style="margin:0 0 14px;font-size:15px;color:#111111;">Hello ${name},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#525252;">
          Enter the code below to verify your email address. This code expires in <strong>10 minutes</strong>.
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

	welcome: (name: string) => ({
		subject: "Welcome to BuildrHQ",
		html: shell({
			title: "Welcome to BuildrHQ",
			subtitle: "Your account is ready",
			body: `
        <p style="margin:0 0 14px;font-size:15px;color:#111111;">Hello ${name},</p>
        <p style="margin:0 0 18px;font-size:14px;color:#525252;">
          Your email has been verified and your account is ready. You can now sign in and start building.
        </p>

        <div style="margin:20px 0;padding:16px;border:1px solid #e5e5e5;border-radius:10px;background:#fafafa;">
          <p style="margin:0 0 10px;font-size:13px;font-weight:600;color:#111111;">What's waiting for you</p>
          <ul style="margin:0;padding-left:18px;color:#525252;font-size:13px;line-height:1.8;">
            <li>Build and showcase your developer portfolio</li>
            <li>Take skill assessments and earn certifications</li>
            <li>Connect with projects and open source opportunities</li>
            <li>AI-powered tools to accelerate your growth</li>
          </ul>
        </div>

        <p style="text-align:center;margin:24px 0 8px;">
          <a href="${appUrl()}/home"
             style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;">
            Go to dashboard
          </a>
        </p>
      `,
		}),
	}),

	resetPasswordOTP: (name: string, otp: string) => ({
		subject: "Reset your password — BuildrHQ",
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

	passwordResetConfirmation: (name: string) => ({
		subject: "Your password has been reset — BuildrHQ",
		html: shell({
			title: "Password updated",
			subtitle: "Your account password has been changed",
			body: `
        <p style="margin:0 0 14px;font-size:15px;color:#111111;">Hello ${name},</p>
        <p style="margin:0 0 18px;font-size:14px;color:#525252;">
          Your password has been successfully updated. You can now sign in with your new password.
        </p>

        <p style="text-align:center;margin:24px 0 8px;">
          <a href="${appUrl()}/signin"
             style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;">
            Sign in
          </a>
        </p>

        <div style="margin:16px 0;padding:14px;border:1px solid #e5e5e5;border-radius:8px;background:#fafafa;font-size:13px;color:#525252;">
          If you did not make this change, please contact our support team immediately.
        </div>
      `,
		}),
	}),

	verifyEmail: (name: string, verifyLink: string) => ({
		subject: "Verify your email — BuildrHQ",
		html: shell({
			title: "Verify your email",
			subtitle: "One click to activate your account",
			body: `
        <p style="margin:0 0 14px;font-size:15px;color:#111111;">Hello ${name},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#525252;">
          Click the button below to verify your email address and activate your account.
          This link expires in <strong>72 hours</strong>.
        </p>

        <p style="text-align:center;margin:24px 0;">
          <a href="${verifyLink}"
             style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;">
            Verify email address
          </a>
        </p>

        <p style="margin:0 0 8px;font-size:13px;color:#525252;">If the button does not work, copy and paste this URL:</p>
        <p style="margin:0;padding:10px;border:1px solid #e5e5e5;border-radius:8px;background:#fafafa;word-break:break-all;font-family:ui-monospace,monospace;font-size:12px;color:#404040;">
          ${verifyLink}
        </p>
      `,
		}),
	}),

	resetPasswordLink: (name: string, resetLink: string) => ({
		subject: "Reset your password — BuildrHQ",
		html: shell({
			title: "Password reset request",
			subtitle: "Secure access to your account",
			body: `
        <p style="margin:0 0 14px;font-size:15px;color:#111111;">Hello ${name},</p>
        <p style="margin:0 0 20px;font-size:14px;color:#525252;">
          We received a request to reset your password. Click the button below to choose a new one.
        </p>

        <p style="text-align:center;margin:24px 0;">
          <a href="${resetLink}"
             style="display:inline-block;background:#171717;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:8px;font-size:14px;font-weight:600;">
            Reset password
          </a>
        </p>

        <div style="margin:16px 0;padding:14px;border:1px solid #e5e5e5;border-radius:8px;background:#fafafa;font-size:13px;color:#525252;">
          This link expires in 1 hour and can be used once.
        </div>

        <p style="margin:0 0 8px;font-size:13px;color:#525252;">If the button does not work, copy and paste this URL:</p>
        <p style="margin:0;padding:10px;border:1px solid #e5e5e5;border-radius:8px;background:#fafafa;word-break:break-all;font-family:ui-monospace,monospace;font-size:12px;color:#404040;">
          ${resetLink}
        </p>
      `,
		}),
	}),

};

// ─── Sender ───────────────────────────────────────────────────────────────────

export type AuthEmailType =
	| "VERIFY_OTP"
	| "WELCOME"
	| "RESET_PASSWORD_OTP"
	| "CONFORMATION_MAIL"
	| "VERIFY"
	| "RESET_PASSWORD";

export interface SendAuthEmailParams {
	name?: string;
	email: string;
	emailType: AuthEmailType;
	token?: string | null;
	otp?: string;
}

export async function sendAuthEmail({
	name,
	email,
	emailType,
	token,
	otp,
}: SendAuthEmailParams) {
	const displayName = name || "there";
	let template: { subject: string; html: string };

	switch (emailType) {
		case "VERIFY_OTP": {
			if (!otp) throw new Error("otp is required for VERIFY_OTP");
			template = authEmailTemplates.verifyOTP(displayName, otp);
			break;
		}
		case "WELCOME": {
			template = authEmailTemplates.welcome(displayName);
			break;
		}
		case "RESET_PASSWORD_OTP": {
			if (!otp) throw new Error("otp is required for RESET_PASSWORD_OTP");
			template = authEmailTemplates.resetPasswordOTP(displayName, otp);
			break;
		}
		case "CONFORMATION_MAIL": {
			template = authEmailTemplates.passwordResetConfirmation(displayName);
			break;
		}
		case "VERIFY": {
			if (!token) throw new Error("token is required for VERIFY");
			const verifyLink = `${appUrl()}/verify?token=${token}`;
			template = authEmailTemplates.verifyEmail(displayName, verifyLink);
			break;
		}
		case "RESET_PASSWORD": {
			if (!token) throw new Error("token is required for RESET_PASSWORD");
			const resetLink = `${appUrl()}/resetpassword?token=${token}`;
			template = authEmailTemplates.resetPasswordLink(displayName, resetLink);
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
		console.error("Failed to send email:", result.error);
		throw new Error(result.error.message);
	}

	console.log("Email sent successfully:", result.data?.id);
	return result;
}
