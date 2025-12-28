import { Resend } from "resend";
import { NextResponse } from "next/server";

type EmailType = "WELCOME" | "VERIFY" | "VERIFY_OTP" | "RESET_PASSWORD" | "RESET_PASSWORD_OTP" | "CONFORMATION_MAIL";

interface SendEmailProps {
    name?: string;
    email: string;
    emailType: EmailType;
    token?: string | null;
    otp?: string;
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

const welcomeEmailTemplate = (name: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Welcome to CoderzLab</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .greeting {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
        }
        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.7;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .features {
            background: #f8fafc;
            padding: 30px;
            margin: 30px 0;
            border-radius: 8px;
        }
        .feature {
            display: flex;
            align-items: center;
            margin-bottom: 15px;
        }
        .feature-icon {
            width: 24px;
            height: 24px;
            background: #667eea;
            border-radius: 50%;
            margin-right: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
        }
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
        .social-links {
            margin-top: 20px;
        }
        .social-links a {
            display: inline-block;
            margin: 0 10px;
            color: #667eea;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🚀 CoderzLab</div>
            <div class="tagline">Where Developers Thrive</div>
        </div>
        <div class="content">
            <div class="greeting">Welcome aboard, ${name}! 🎉</div>
            <div class="message">
                We're thrilled to have you join our community of passionate developers. You're now part of a platform that's designed to accelerate your coding journey and connect you with opportunities that matter.
            </div>
            <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/dashboard" class="cta-button">Explore Your Dashboard</a>
            </div>
            <div class="features">
                <h3 style="margin-bottom: 20px; color: #1f2937;">What's waiting for you:</h3>
                <div class="feature">
                    <div class="feature-icon">🤖</div>
                    <span>AI-powered coding tools and assistance</span>
                </div>
                <div class="feature">
                    <div class="feature-icon">🏆</div>
                    <span>Skill assessments and certifications</span>
                </div>
                <div class="feature">
                    <div class="feature-icon">👥</div>
                    <span>Connect with fellow developers</span>
                </div>
                <div class="feature">
                    <div class="feature-icon">💼</div>
                    <span>Showcase your projects and portfolio</span>
                </div>
            </div>
            <div class="message">
                Ready to start building amazing things? Your dashboard is waiting with personalized recommendations and tools to help you succeed.
            </div>
        </div>
        <div class="footer">
            <p>© 2024 CoderzLab. All rights reserved.</p>
            <p>Building the future, one line of code at a time.</p>
            <div class="social-links">
                <a href="#">Twitter</a> • <a href="#">LinkedIn</a> • <a href="#">GitHub</a>
            </div>
        </div>
    </div>
</body>
</html>
`;

const verifyEmailTemplate = (verifyLink: string, token: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - CoderzLab</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.7;
            text-align: center;
        }
        .verify-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .verify-button:hover {
            transform: translateY(-2px);
        }
        .fallback-link {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 14px;
            color: #374151;
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .security-note h4 {
            color: #92400e;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .security-note p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔐 CoderzLab</div>
            <div class="tagline">Secure Your Account</div>
        </div>
        <div class="content">
            <div class="title">Verify Your Email Address</div>
            <div class="message">
                Thanks for joining CoderzLab! To complete your registration and unlock all features, please verify your email address by clicking the button below.
            </div>
            <div style="text-align: center;">
                <a href="${verifyLink}" class="verify-button">Verify Email Address</a>
            </div>
            <div class="fallback-link">
                <strong>If the button doesn't work, copy and paste this link:</strong><br>
                ${verifyLink}
            </div>
            <div class="security-note">
                <h4>🔒 Security Notice</h4>
                <p>This verification link will expire in 72 hours for your security. If you didn't create an account with CoderzLab, please ignore this email or contact our support team.</p>
            </div>
            <div class="message">
                Once verified, you'll have access to all our premium features including AI coding tools, skill assessments, and developer communities.
            </div>
        </div>
        <div class="footer">
            <p>© 2024 CoderzLab. All rights reserved.</p>
            <p>Need help? Contact us at support@coderzlab.com</p>
        </div>
    </div>
</body>
</html>
`;

const resetPasswordTemplate = (resetLink: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reset Your Password - CoderzLab</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.7;
            text-align: center;
        }
        .reset-button {
            display: inline-block;
            background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .reset-button:hover {
            transform: translateY(-2px);
        }
        .fallback-link {
            background: #f3f4f6;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
            word-break: break-all;
            font-family: monospace;
            font-size: 14px;
            color: #374151;
        }
        .security-note {
            background: #fef3c7;
            border: 1px solid #f59e0b;
            padding: 20px;
            border-radius: 8px;
            margin: 20px 0;
        }
        .security-note h4 {
            color: #92400e;
            margin-bottom: 10px;
            font-size: 16px;
        }
        .security-note p {
            color: #92400e;
            font-size: 14px;
            margin: 0;
        }
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">🔑 CoderzLab</div>
            <div class="tagline">Password Reset</div>
        </div>
        <div class="content">
            <div class="title">Reset Your Password</div>
            <div class="message">
                We received a request to reset your password. If you didn't make this request, you can safely ignore this email.
            </div>
            <div style="text-align: center;">
                <a href="${resetLink}" class="reset-button">Reset Password</a>
            </div>
            <div class="fallback-link">
                <strong>If the button doesn't work, copy and paste this link:</strong><br>
                ${resetLink}
            </div>
            <div class="security-note">
                <h4>⏰ Time Sensitive</h4>
                <p>This password reset link will expire in 1 hour for security reasons. If you need to reset your password after that, please request a new reset link.</p>
            </div>
            <div class="message">
                After resetting your password, you'll be able to access all your projects and continue your coding journey.
            </div>
        </div>
        <div class="footer">
            <p>© 2024 CoderzLab. All rights reserved.</p>
            <p>Need help? Contact us at support@coderzlab.com</p>
        </div>
    </div>
</body>
</html>
`;

const confirmationEmailTemplate = () => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Password Reset Confirmation - CoderzLab</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.7;
            text-align: center;
        }
        .success-icon {
            text-align: center;
            font-size: 48px;
            margin: 20px 0;
        }
        .cta-button {
            display: inline-block;
            background: linear-gradient(135deg, #10b981 0%, #059669 100%);
            color: white;
            padding: 16px 32px;
            text-decoration: none;
            border-radius: 8px;
            font-weight: 600;
            font-size: 16px;
            margin: 20px 0;
            transition: transform 0.2s ease;
        }
        .cta-button:hover {
            transform: translateY(-2px);
        }
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            color: #6b7280;
            font-size: 14px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">✅ CoderzLab</div>
            <div class="tagline">Password Updated</div>
        </div>
        <div class="content">
            <div class="success-icon">🎉</div>
            <div class="title">Password Successfully Reset</div>
            <div class="message">
                Your password has been successfully updated. You can now sign in to your account with your new password.
            </div>
            <div style="text-align: center;">
                <a href="${process.env.NEXTAUTH_URL}/signin" class="cta-button">Sign In Now</a>
            </div>
            <div class="message">
                If you didn't request this password reset, please contact our support team immediately at support@coderzlab.com
            </div>
        </div>
        <div class="footer">
            <p>© 2024 CoderzLab. All rights reserved.</p>
            <p>Thank you for choosing CoderzLab!</p>
        </div>
    </div>
</body>
</html>
`;

const verifyOTPTemplate = (name: string, otp: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verify Your Email - TheCoderz</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #0d9488 0%, #059669 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.7;
            text-align: center;
        }
        .otp-container {
            background: #f8fafc;
            border: 2px dashed #0d9488;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 700;
            color: #0d9488;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin-bottom: 10px;
        }
        .otp-label {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
        }
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .warning-text {
            font-size: 14px;
            color: #92400e;
            margin: 0;
        }
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            font-size: 14px;
            color: #6b7280;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">TheCoderz</div>
            <div class="tagline">Your Coding Journey Starts Here</div>
        </div>
        <div class="content">
            <div class="title">Verify Your Email Address</div>
            <p class="message">
                Hello ${name || 'there'}!<br><br>
                Thanks for joining TheCoderz! To complete your registration and unlock all features, please use the verification code below:
            </p>
            
            <div class="otp-container">
                <div class="otp-code">${otp}</div>
                <div class="otp-label">Your 6-digit verification code</div>
            </div>
            
            <div class="warning">
                <p class="warning-text">
                    <strong>Important:</strong> This code will expire in 10 minutes. If you didn't request this verification, please ignore this email.
                </p>
            </div>
            
            <p class="message">
                Simply enter this code on the verification page to activate your account and start your coding journey with us!
            </p>
        </div>
        <div class="footer">
            <p><strong>TheCoderz Team</strong></p>
            <p>Building the future of coding education</p>
            <p>Need help? Contact us at support@thecoderz.com</p>
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
    <title>Reset Your Password - TheCoderz</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #333;
            background-color: #f8fafc;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
        }
        .header {
            background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%);
            padding: 40px 30px;
            text-align: center;
            color: white;
        }
        .logo {
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 10px;
            letter-spacing: -0.5px;
        }
        .tagline {
            font-size: 16px;
            opacity: 0.9;
            font-weight: 400;
        }
        .content {
            padding: 40px 30px;
        }
        .title {
            font-size: 24px;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 20px;
            text-align: center;
        }
        .message {
            font-size: 16px;
            color: #6b7280;
            margin-bottom: 30px;
            line-height: 1.7;
            text-align: center;
        }
        .otp-container {
            background: #fef2f2;
            border: 2px dashed #dc2626;
            border-radius: 12px;
            padding: 30px;
            text-align: center;
            margin: 30px 0;
        }
        .otp-code {
            font-size: 36px;
            font-weight: 700;
            color: #dc2626;
            letter-spacing: 8px;
            font-family: 'Courier New', monospace;
            margin-bottom: 10px;
        }
        .otp-label {
            font-size: 14px;
            color: #6b7280;
            font-weight: 500;
        }
        .warning {
            background: #fef3c7;
            border-left: 4px solid #f59e0b;
            padding: 15px 20px;
            margin: 20px 0;
            border-radius: 0 8px 8px 0;
        }
        .warning-text {
            font-size: 14px;
            color: #92400e;
            margin: 0;
        }
        .footer {
            background: #f8fafc;
            padding: 30px;
            text-align: center;
            border-top: 1px solid #e5e7eb;
        }
        .footer p {
            font-size: 14px;
            color: #6b7280;
            margin: 5px 0;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <div class="logo">TheCoderz</div>
            <div class="tagline">Your Coding Journey Starts Here</div>
        </div>
        <div class="content">
            <div class="title">Reset Your Password</div>
            <p class="message">
                Hello ${name || 'there'}!<br><br>
                We received a request to reset your password for your TheCoderz account. Use the code below to reset your password:
            </p>
            
            <div class="otp-container">
                <div class="otp-code">${otp}</div>
                <div class="otp-label">Your 6-digit password reset code</div>
            </div>
            
            <div class="warning">
                <p class="warning-text">
                    <strong>Important:</strong> This code will expire in 10 minutes. If you didn't request this password reset, please ignore this email and your password will remain unchanged.
                </p>
            </div>
            
            <p class="message">
                Enter this code on the password reset page to create a new password for your account.
            </p>
        </div>
        <div class="footer">
            <p><strong>TheCoderz Team</strong></p>
            <p>Building the future of coding education</p>
            <p>Need help? Contact us at support@thecoderz.com</p>
        </div>
    </div>
</body>
</html>
`;

export const sendEmail = async ({ name, email, emailType, token, otp }: SendEmailProps) => {
    console.log("Sending email:", { name, email, emailType, token });

    try {
        let emailOptions: any;

        switch (emailType) {
            case "WELCOME":
                emailOptions = {
                    from: "The Coder'z <noreply@coderzai.xyz>",
                    to: email,
                    subject: "Welcome to CoderzLab! 🚀",
                    html: welcomeEmailTemplate(name || "Developer")
                };
                break;
            case "RESET_PASSWORD":
                if (!token) {
                    throw new Error("No token found for password reset");
                }
                const resetLink = `${process.env.NEXTAUTH_URL}/resetpassword?token=${token}`;
                emailOptions = {
                    from: "The Coder'z <noreply@coderzai.xyz>",
                    to: email,
                    subject: "Reset Your Password - CoderzLab",
                    html: resetPasswordTemplate(resetLink)
                };
                break;
            case "VERIFY":
                if (!token) {
                    throw new Error("No token found for email verification");
                }
                const verifyLink = `${process.env.NEXTAUTH_URL}/verify?token=${token}`;
                emailOptions = {
                    from: "The Coder'z <noreply@coderzai.xyz>",
                    to: email,
                    subject: "Verify Your Email - CoderzLab",
                    html: verifyEmailTemplate(verifyLink, token)
                };
                break;
            case "CONFORMATION_MAIL":
                emailOptions = {
                    from: "The Coder'z <noreply@coderzai.xyz>",
                    to: email,
                    subject: "Password Reset Confirmation - CoderzLab",
                    html: confirmationEmailTemplate()
                };
                break;
            case "VERIFY_OTP":
                if (!otp) {
                    throw new Error("No OTP found for email verification");
                }
                emailOptions = {
                    from: "The Coder'z <noreply@coderzai.xyz>",
                    to: email,
                    subject: "Verify Your Email - TheCoderz",
                    html: verifyOTPTemplate(name || "Developer", otp)
                };
                break;
            case "RESET_PASSWORD_OTP":
                if (!otp) {
                    throw new Error("No OTP found for password reset");
                }
                emailOptions = {
                    from: "The Coder'z <noreply@coderzai.xyz>",
                    to: email,
                    subject: "Reset Your Password - TheCoderz",
                    html: resetPasswordOTPTemplate(name || "Developer", otp)
                };
                break;
            default:
                throw new Error("Invalid email type");
        }

        const result = await getResend().emails.send(emailOptions);
        console.log("Email sent successfully:", result);
        return result;
    } catch (error: any) {
        console.error("Email sending failed:", error);
        throw error;
    }
};