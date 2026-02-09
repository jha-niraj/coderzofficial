import { Resend } from "resend";

type EmailType = "WELCOME" | "VERIFY_OTP" | "RESET_PASSWORD_OTP" | "COMPANY_WELCOME" | "MEMBER_INVITATION" | "TEACHER_CREDENTIALS";

interface SendEmailProps {
    name?: string;
    email: string;
    emailType: EmailType;
    otp?: string;
    companyName?: string;
    inviteLink?: string;
    temporaryPassword?: string;
    universityName?: string;
    roleName?: string;
}

// Lazy initialization to avoid "Missing API key" error during build
let resendInstance: Resend | null = null;

function getResend(): Resend {
    if (!resendInstance) {
        if (!process.env.RESEND_API_KEY) {
            throw new Error("RESEND_API_KEY environment variable is not set");
        }
        resendInstance = new Resend(process.env.RESEND_API_KEY);
    }
    return resendInstance;
}

const verifyOTPTemplate = (name: string, otp: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - Coder'z Hiring</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #171717;
            background-color: #fafafa;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: #171717;
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .tagline { font-size: 14px; opacity: 0.7; font-family: monospace; }
        .content { padding: 40px 30px; }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #171717;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            color: #525252;
            margin-bottom: 30px;
            line-height: 1.7;
            text-align: center;
        }
        .otp-container {
            background: #fafafa;
            border: 2px dashed #d4d4d4;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 700;
            color: #171717;
            letter-spacing: 8px;
            font-family: monospace;
            margin-bottom: 10px;
        }
        .otp-label {
            font-size: 12px;
            color: #737373;
            font-family: monospace;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .warning-text { font-size: 14px; color: #92400e; margin: 0; }
        .footer {
            background: #fafafa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e5e5;
        }
        .footer p { font-size: 14px; color: #737373; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">CODER'Z HIRING</div>
            <div class="tagline">// Verify Your Identity</div>
        </div>
        <div class="content">
            <div class="title">Verify Your Workspace Access</div>
            <p class="message">
                Hello ${name || 'there'},<br><br>
                To complete your registration with Coder'z Hiring, please enter the verification code below:
            </p>
            
            <div class="otp-container">
                <div class="otp-code">${otp}</div>
                <div class="otp-label">6-Digit Verification Code</div>
            </div>
            
            <div class="warning">
                <p class="warning-text">
                    <strong>⏱ Time Sensitive:</strong> This code expires in 10 minutes. If you didn't create an account, please ignore this email.
                </p>
            </div>
        </div>
        <div class="footer">
            <p><strong>Coder'z Hiring Team</strong></p>
            <p>Precision Engineering Talent Acquisition</p>
        </div>
    </div>
</body>
</html>
`;

const resetPasswordOTPTemplate = (name: string, otp: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - Coder'z Hiring</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #171717;
            background-color: #fafafa;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: #171717;
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .tagline { font-size: 14px; opacity: 0.7; font-family: monospace; }
        .content { padding: 40px 30px; }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #171717;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            color: #525252;
            margin-bottom: 30px;
            line-height: 1.7;
            text-align: center;
        }
        .otp-container {
            background: #fafafa;
            border: 2px dashed #d4d4d4;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 700;
            color: #171717;
            letter-spacing: 8px;
            font-family: monospace;
            margin-bottom: 10px;
        }
        .otp-label {
            font-size: 12px;
            color: #737373;
            font-family: monospace;
            text-transform: uppercase;
            letter-spacing: 1px;
        }
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .warning-text { font-size: 14px; color: #92400e; margin: 0; }
        .footer {
            background: #fafafa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e5e5;
        }
        .footer p { font-size: 14px; color: #737373; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">CODER'Z HIRING</div>
            <div class="tagline">// Password Reset</div>
        </div>
        <div class="content">
            <div class="title">Reset Your Password</div>
            <p class="message">
                Hello ${name || 'there'},<br><br>
                We received a request to reset your password. Use the code below to complete the process:
            </p>
            
            <div class="otp-container">
                <div class="otp-code">${otp}</div>
                <div class="otp-label">Password Reset Code</div>
            </div>
            
            <div class="warning">
                <p class="warning-text">
                    <strong>🔒 Security Notice:</strong> This code expires in 10 minutes. If you didn't request this, please ignore this email.
                </p>
            </div>
        </div>
        <div class="footer">
            <p><strong>Coder'z Hiring Team</strong></p>
            <p>Precision Engineering Talent Acquisition</p>
        </div>
    </div>
</body>
</html>
`;

const companyWelcomeTemplate = (name: string, companyName: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to Coder'z Hiring</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #171717;
            background-color: #fafafa;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: #171717;
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .tagline { font-size: 14px; opacity: 0.7; font-family: monospace; }
        .content { padding: 40px 30px; }
        .title { font-size: 24px; font-weight: 600; color: #171717; margin-bottom: 20px; }
        .message { font-size: 16px; color: #525252; margin-bottom: 20px; line-height: 1.7; }
        .features {
            background: #fafafa;
            padding: 24px;
            border-radius: 12px;
            margin: 24px 0;
        }
        .feature { display: flex; align-items: center; margin-bottom: 12px; }
        .feature-bullet { width: 8px; height: 8px; background: #171717; border-radius: 50%; margin-right: 12px; }
        .cta-button {
            display: inline-block;
            background: #171717;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
        }
        .footer {
            background: #fafafa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e5e5;
        }
        .footer p { font-size: 14px; color: #737373; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">CODER'Z HIRING</div>
            <div class="tagline">// Workspace Initialized</div>
        </div>
        <div class="content">
            <div class="title">Welcome, ${name}! 🚀</div>
            <p class="message">
                Your company workspace for <strong>${companyName}</strong> is now active. You're ready to start finding exceptional engineering talent.
            </p>
            
            <div class="features">
                <h4 style="margin-bottom: 16px; font-size: 14px; text-transform: uppercase; letter-spacing: 1px; color: #737373;">What's Available:</h4>
                <div class="feature">
                    <div class="feature-bullet"></div>
                    <span>Access to pre-vetted candidates</span>
                </div>
                <div class="feature">
                    <div class="feature-bullet"></div>
                    <span>AI-powered candidate matching</span>
                </div>
                <div class="feature">
                    <div class="feature-bullet"></div>
                    <span>Automated technical assessments</span>
                </div>
                <div class="feature">
                    <div class="feature-bullet"></div>
                    <span>Team collaboration tools</span>
                </div>
            </div>
            
            <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" class="cta-button">Open Dashboard →</a>
            </div>
        </div>
        <div class="footer">
            <p><strong>Coder'z Hiring Team</strong></p>
            <p>Pr ecision Engineering Talent Acquisition</p>
        </div>
    </div>
</body>
</html>
`;

const teacherCredentialsTemplate = (name: string, email: string, temporaryPassword: string, universityName: string, roleName: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Your University Account - Coder'z</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            color: #171717;
            background-color: #fafafa;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            overflow: hidden;
            box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
        }
        .header {
            background: #171717;
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo { font-size: 24px; font-weight: 700; margin-bottom: 8px; }
        .tagline { font-size: 14px; opacity: 0.7; font-family: monospace; }
        .content { padding: 40px 30px; }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #171717;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            color: #525252;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .credential-container {
            background: #f5f5f5;
            border: 1px solid #e5e5e5;
            border-radius: 12px;
            padding: 24px;
            margin: 24px 0;
        }
        .credential-label {
            font-size: 12px;
            color: #737373;
            font-family: monospace;
            text-transform: uppercase;
            letter-spacing: 1px;
            margin-bottom: 4px;
        }
        .credential-value {
            font-size: 18px;
            font-weight: 600;
            color: #171717;
            font-family: monospace;
            margin-bottom: 16px;
        }
        .role-badge {
            display: inline-block;
            background: #eef2ff;
            color: #4f46e5;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-top: 8px;
        }
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .warning-text { font-size: 14px; color: #92400e; margin: 0; }
        .cta-button {
            display: inline-block;
            background: #171717;
            color: white;
            padding: 14px 28px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 14px;
        }
        .footer {
            background: #fafafa;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e5e5;
        }
        .footer p { font-size: 14px; color: #737373; margin: 5px 0; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">CODER'Z UNIVERSITY</div>
            <div class="tagline">// Your Account is Ready</div>
        </div>
        <div class="content">
            <div class="title">Welcome to ${universityName}! 🎓</div>
            <p class="message">
                Hello ${name || 'there'},<br><br>
                You have been invited to join <strong>${universityName}</strong> as a <span class="role-badge">${roleName}</span>. Your account has been created with the following credentials:
            </p>
            
            <div class="credential-container">
                <div class="credential-label">Email Address</div>
                <div class="credential-value">${email}</div>
                
                <div class="credential-label">Temporary Password</div>
                <div class="credential-value">${temporaryPassword}</div>
            </div>
            
            <div class="warning">
                <p class="warning-text">
                    <strong>🔒 Security Notice:</strong> Please change your password immediately after your first login. Go to Profile → Security to update your password.
                </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
                <a href="${process.env.NEXT_PUBLIC_UNI_URL || 'https://uni.coderzai.xyz'}/signin" class="cta-button">Sign In to Your Account →</a>
            </div>
        </div>
        <div class="footer">
            <p><strong>Coder'z University Platform</strong></p>
            <p>Building Practical Skills for Tomorrow</p>
        </div>
    </div>
</body>
</html>
`;

export async function sendEmail({ name, email, emailType, otp, companyName, temporaryPassword, universityName, roleName }: SendEmailProps) {
    const resend = getResend();

    let subject = "";
    let html = "";

    switch (emailType) {
        case "VERIFY_OTP":
            subject = "Verify Your Email - Coder'z Hiring";
            html = verifyOTPTemplate(name || "", otp || "");
            break;
        case "RESET_PASSWORD_OTP":
            subject = "Reset Your Password - Coder'z Hiring";
            html = resetPasswordOTPTemplate(name || "", otp || "");
            break;
        case "COMPANY_WELCOME":
            subject = "Welcome to Coder'z Hiring!";
            html = companyWelcomeTemplate(name || "", companyName || "Your Company");
            break;
        case "TEACHER_CREDENTIALS":
            subject = `Your Account at ${universityName || "University"} - Coder'z`;
            html = teacherCredentialsTemplate(
                name || "",
                email,
                temporaryPassword || "",
                universityName || "University",
                roleName || "Faculty"
            );
            break;
        default:
            throw new Error(`Unknown email type: ${emailType}`);
    }

    const { data, error } = await resend.emails.send({
        from: "Coder'z <noreply@coderzai.xyz>",
        to: email,
        subject,
        html,
    });

    if (error) {
        console.error("Error sending email:", error);
        throw error;
    }

    return data;
}