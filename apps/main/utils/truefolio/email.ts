import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendTransferVerificationEmail(
	userEmail: string,
	userName: string,
	transferId: string,
	creditsRequested: number,
	verificationToken: string
) {
	const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL}/verify?token=${verificationToken}`;

	// For development, use test email
	const targetEmail = process.env.NODE_ENV === 'development'
		? 'shunyatechofficial@gmail.com'
		: userEmail;

	try {
		const { data, error } = await resend.emails.send({
			from: 'Acme <onboarding@resend.dev>',
			to: [targetEmail],
			subject: 'Verify Your Credit Transfer Request',
			html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Verify Credit Transfer</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
              min-height: 100vh;
              padding: 20px;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
              overflow: hidden;
              border: 1px solid #e5e7eb;
            }
            
            .header {
              background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
              padding: 32px 24px;
              text-align: center;
              position: relative;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="0.5" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="0.5" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.3" fill="white" opacity="0.1"/><circle cx="20" cy="80" r="0.3" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23grain)"/></svg>');
            }
            
            .logo-container {
              width: 64px;
              height: 64px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 16px;
              margin: 0 auto 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              z-index: 1;
            }
            
            .logo-icon {
              width: 32px;
              height: 32px;
              color: white;
            }
            
            .header-title {
              color: white;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
              position: relative;
              z-index: 1;
            }
            
            .header-subtitle {
              color: rgba(255, 255, 255, 0.9);
              font-size: 16px;
              font-weight: 500;
              position: relative;
              z-index: 1;
            }
            
            .content {
              padding: 32px 24px;
            }
            
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 16px;
            }
            
            .description {
              font-size: 16px;
              color: #4b5563;
              margin-bottom: 24px;
              line-height: 1.7;
            }
            
            .transfer-card {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
              position: relative;
              overflow: hidden;
            }
            
            .transfer-card::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 100%);
            }
            
            .transfer-header {
              display: flex;
              align-items: center;
              gap: 12px;
              margin-bottom: 20px;
            }
            
            .transfer-icon {
              width: 40px;
              height: 40px;
              background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
              border-radius: 10px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            
            .transfer-title {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
            }
            
            .detail-grid {
              display: grid;
              gap: 16px;
            }
            
            .detail-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              padding: 12px 0;
              border-bottom: 1px solid #e5e7eb;
            }
            
            .detail-row:last-child {
              border-bottom: none;
            }
            
            .detail-label {
              font-weight: 600;
              color: #6b7280;
              font-size: 14px;
            }
            
            .detail-value {
              font-weight: 600;
              color: #1f2937;
              font-size: 14px;
            }
            
            .credits-highlight {
              color: #059669;
              font-size: 18px;
              font-weight: 700;
            }
            
            .verify-section {
              text-align: center;
              margin: 32px 0;
            }
            
            .verify-button {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
              transition: all 0.3s ease;
            }
            
            .verify-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4);
            }
            
            .warning-card {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 1px solid #f59e0b;
              border-radius: 12px;
              padding: 20px;
              margin: 24px 0;
              position: relative;
            }
            
            .warning-card::before {
              content: '⚠️';
              position: absolute;
              top: 16px;
              left: 16px;
              font-size: 20px;
            }
            
            .warning-content {
              margin-left: 32px;
            }
            
            .warning-title {
              font-weight: 700;
              color: #92400e;
              margin-bottom: 4px;
            }
            
            .warning-text {
              color: #b45309;
              font-size: 14px;
              line-height: 1.5;
            }
            
            .link-section {
              background: #f9fafb;
              border-radius: 8px;
              padding: 16px;
              margin: 20px 0;
            }
            
            .link-label {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 8px;
            }
            
            .link-url {
              word-break: break-all;
              color: #3b82f6;
              font-size: 14px;
              font-family: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', Consolas, 'Courier New', monospace;
              background: white;
              padding: 8px 12px;
              border-radius: 6px;
              border: 1px solid #e5e7eb;
            }
            
            .footer {
              background: #f9fafb;
              padding: 24px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            
            .footer-text {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 8px;
            }
            
            .dev-notice {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 12px 16px;
              margin: 16px 0;
              font-size: 13px;
              color: #92400e;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            @media (max-width: 640px) {
              .email-container {
                margin: 10px;
                border-radius: 12px;
              }
              
              .header {
                padding: 24px 20px;
              }
              
              .content {
                padding: 24px 20px;
              }
              
              .transfer-card {
                padding: 20px;
              }
              
              .detail-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
              }
              
              .verify-button {
                padding: 14px 24px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="logo-container">
                <svg class="logo-icon" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7L12 12L22 7L12 2Z"/>
                  <path d="M2 17L12 22L22 17"/>
                  <path d="M2 12L12 17L22 12"/>
                </svg>
              </div>
              <h1 class="header-title">TrueFolio</h1>
              <p class="header-subtitle">Credit Transfer Verification</p>
            </div>
            
            ${process.env.NODE_ENV === 'development' ? `
              <div class="dev-notice">
                🧪 <strong>Development Mode:</strong> This email was sent to the test address. 
                In production, it would be sent to: ${userEmail}
              </div>
            ` : ''}
            
            <div class="content">
              <p class="greeting">Hi ${userName},</p>
              
              <p class="description">
                You've requested to transfer credits from your Coders.in account to TrueFolio. 
                Please verify this request by clicking the button below to complete the transfer.
              </p>
              
              <div class="transfer-card">
                <div class="transfer-header">
                  <div class="transfer-icon">
                    <svg width="20" height="20" fill="#3b82f6" viewBox="0 0 24 24">
                      <path d="M4 4h6v6H4zm10 0h6v6h-6zM4 14h6v6H4zm10 5h6v1h-6z"/>
                    </svg>
                  </div>
                  <h3 class="transfer-title">Transfer Details</h3>
                </div>
                
                <div class="detail-grid">
                  <div class="detail-row">
                    <span class="detail-label">Credits Requested</span>
                    <span class="detail-value credits-highlight">${creditsRequested}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">From Platform</span>
                    <span class="detail-value">Coders.in</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">To Platform</span>
                    <span class="detail-value">TrueFolio</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">Transfer ID</span>
                    <span class="detail-value">${transferId}</span>
                  </div>
                  <div class="detail-row">
                    <span class="detail-label">User Email</span>
                    <span class="detail-value">${userEmail}</span>
                  </div>
                </div>
              </div>
              
              <div class="verify-section">
                <a href="${verificationUrl}" class="verify-button">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  Verify Transfer
                </a>
              </div>
              
              <div class="warning-card">
                <div class="warning-content">
                  <div class="warning-title">Important Security Notice</div>
                  <div class="warning-text">
                    This verification link will expire in 15 minutes for security reasons. 
                    If you didn't request this transfer, please ignore this email.
                  </div>
                </div>
              </div>
              
              <div class="link-section">
                <p class="link-label">If the button doesn't work, copy and paste this link:</p>
                <div class="link-url">${verificationUrl}</div>
              </div>
            </div>
            
            <div class="footer">
              <p class="footer-text">This email was sent from TrueFolio Credit Transfer System</p>
              <p class="footer-text">If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
			text: `
        Hi ${userName},
        
        ${process.env.NODE_ENV === 'development' ? `[DEV MODE] This email was sent to test address. Production would send to: ${userEmail}\n\n` : ''}
        
        You've requested to transfer ${creditsRequested} credits from your Coders.in account to TrueFolio.
        
        Please verify this request by clicking the following link:
        ${verificationUrl}
        
        Transfer Details:
        - Credits: ${creditsRequested}
        - From: Coders.in
        - To: TrueFolio
        - Transfer ID: ${transferId}
        - User Email: ${userEmail}
        
        This link will expire in 15 minutes for security reasons.
        
        If you didn't request this transfer, please ignore this email.
        
        Best regards,
        TrueFolio Team
      `
		});

		if (error) {
			console.error('Email sending error:', error);
			throw new Error('Failed to send verification email');
		}

		return { success: true, messageId: data?.id };
	} catch (error) {
		console.error('Email sending error:', error);
		throw new Error('Failed to send verification email');
	}
}

export async function sendTransferCompletionEmail(
	userEmail: string,
	userName: string,
	creditsTransferred: number,
	newBalance: number
) {
	// For development, use test email
	const targetEmail = process.env.NODE_ENV === 'development'
		? 'shunyatechofficial@gmail.com'
		: userEmail;

	try {
		const { data, error } = await resend.emails.send({
			from: 'Acme <onboarding@resend.dev>',
			to: [targetEmail],
			subject: 'Credit Transfer Completed Successfully',
			html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Transfer Completed</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
              line-height: 1.6;
              color: #1f2937;
              background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
              min-height: 100vh;
              padding: 20px;
            }
            
            .email-container {
              max-width: 600px;
              margin: 0 auto;
              background: #ffffff;
              border-radius: 16px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
              overflow: hidden;
              border: 1px solid #e5e7eb;
            }
            
            .header {
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              padding: 32px 24px;
              text-align: center;
              position: relative;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              bottom: 0;
              background: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><defs><pattern id="success-grain" width="100" height="100" patternUnits="userSpaceOnUse"><circle cx="25" cy="25" r="0.5" fill="white" opacity="0.1"/><circle cx="75" cy="75" r="0.5" fill="white" opacity="0.1"/><circle cx="50" cy="10" r="0.3" fill="white" opacity="0.1"/><circle cx="20" cy="80" r="0.3" fill="white" opacity="0.1"/></pattern></defs><rect width="100" height="100" fill="url(%23success-grain)"/></svg>');
            }
            
            .success-icon {
              width: 80px;
              height: 80px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              z-index: 1;
            }
            
            .success-checkmark {
              width: 40px;
              height: 40px;
              color: white;
            }
            
            .header-title {
              color: white;
              font-size: 28px;
              font-weight: 700;
              margin-bottom: 8px;
              position: relative;
              z-index: 1;
            }
            
            .header-subtitle {
              color: rgba(255, 255, 255, 0.9);
              font-size: 16px;
              font-weight: 500;
              position: relative;
              z-index: 1;
            }
            
            .content {
              padding: 32px 24px;
            }
            
            .greeting {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 16px;
            }
            
            .success-message {
              font-size: 16px;
              color: #4b5563;
              margin-bottom: 32px;
              line-height: 1.7;
              text-align: center;
            }
            
            .credits-showcase {
              background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
              border: 2px solid #10b981;
              border-radius: 20px;
              padding: 32px 24px;
              text-align: center;
              margin: 32px 0;
              position: relative;
              overflow: hidden;
            }
            
            .credits-showcase::before {
              content: '';
              position: absolute;
              top: -50%;
              left: -50%;
              width: 200%;
              height: 200%;
              background: radial-gradient(circle, rgba(16, 185, 129, 0.1) 0%, transparent 70%);
              animation: pulse 3s ease-in-out infinite;
            }
            
            @keyframes pulse {
              0%, 100% { transform: scale(1); opacity: 0.7; }
              50% { transform: scale(1.1); opacity: 0.3; }
            }
            
            .credits-icon {
              width: 60px;
              height: 60px;
              background: linear-gradient(135deg, #10b981 0%, #059669 100%);
              border-radius: 50%;
              margin: 0 auto 16px;
              display: flex;
              align-items: center;
              justify-content: center;
              position: relative;
              z-index: 1;
            }
            
            .credits-amount {
              font-size: 48px;
              font-weight: 800;
              color: #059669;
              margin-bottom: 8px;
              position: relative;
              z-index: 1;
            }
            
            .credits-label {
              font-size: 16px;
              font-weight: 600;
              color: #065f46;
              position: relative;
              z-index: 1;
            }
            
            .balance-card {
              background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
              border: 1px solid #e2e8f0;
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
            }
            
            .balance-row {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 12px;
            }
            
            .balance-row:last-child {
              margin-bottom: 0;
              padding-top: 12px;
              border-top: 1px solid #e5e7eb;
            }
            
            .balance-label {
              font-weight: 600;
              color: #6b7280;
            }
            
            .balance-value {
              font-weight: 700;
              color: #1f2937;
              font-size: 18px;
            }
            
            .new-balance {
              color: #3b82f6;
              font-size: 24px;
            }
            
            .cta-section {
              text-align: center;
              margin: 32px 0;
            }
            
            .cta-button {
              display: inline-flex;
              align-items: center;
              gap: 8px;
              background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
              color: white;
              padding: 16px 32px;
              text-decoration: none;
              border-radius: 12px;
              font-weight: 600;
              font-size: 16px;
              box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.3);
              transition: all 0.3s ease;
            }
            
            .cta-button:hover {
              transform: translateY(-2px);
              box-shadow: 0 20px 25px -5px rgba(59, 130, 246, 0.4);
            }
            
            .features-section {
              background: #f9fafb;
              border-radius: 12px;
              padding: 24px;
              margin: 24px 0;
            }
            
            .features-title {
              font-size: 18px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 16px;
              text-align: center;
            }
            
            .features-grid {
              display: grid;
              grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
              gap: 16px;
            }
            
            .feature-item {
              display: flex;
              align-items: center;
              gap: 12px;
              padding: 12px;
              background: white;
              border-radius: 8px;
              border: 1px solid #e5e7eb;
            }
            
            .feature-icon {
              width: 32px;
              height: 32px;
              background: linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%);
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              flex-shrink: 0;
            }
            
            .feature-text {
              font-size: 14px;
              color: #4b5563;
              font-weight: 500;
            }
            
            .footer {
              background: #f9fafb;
              padding: 24px;
              text-align: center;
              border-top: 1px solid #e5e7eb;
            }
            
            .footer-text {
              font-size: 14px;
              color: #6b7280;
              margin-bottom: 8px;
            }
            
            .dev-notice {
              background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%);
              border: 1px solid #f59e0b;
              border-radius: 8px;
              padding: 12px 16px;
              margin: 16px 0;
              font-size: 13px;
              color: #92400e;
              display: flex;
              align-items: center;
              gap: 8px;
            }
            
            @media (max-width: 640px) {
              .email-container {
                margin: 10px;
                border-radius: 12px;
              }
              
              .header {
                padding: 24px 20px;
              }
              
              .content {
                padding: 24px 20px;
              }
              
              .credits-showcase {
                padding: 24px 20px;
              }
              
              .credits-amount {
                font-size: 36px;
              }
              
              .balance-row {
                flex-direction: column;
                align-items: flex-start;
                gap: 4px;
              }
              
              .features-grid {
                grid-template-columns: 1fr;
              }
              
              .cta-button {
                padding: 14px 24px;
                font-size: 15px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-container">
            <div class="header">
              <div class="success-icon">
                <svg class="success-checkmark" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h1 class="header-title">Transfer Completed!</h1>
              <p class="header-subtitle">Your credits are ready to use</p>
            </div>
            
            ${process.env.NODE_ENV === 'development' ? `
              <div class="dev-notice">
                🧪 <strong>Development Mode:</strong> This email was sent to the test address. 
                In production, it would be sent to: ${userEmail}
              </div>
            ` : ''}
            
            <div class="content">
              <p class="greeting">Hi ${userName},</p>
              
              <p class="success-message">
                🎉 Excellent! Your credit transfer has been completed successfully. 
                You can now use these credits to unlock TrueFolio's premium features.
              </p>
              
              <div class="credits-showcase">
                <div class="credits-icon">
                  <svg width="30" height="30" fill="white" viewBox="0 0 24 24">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                  </svg>
                </div>
                <div class="credits-amount">${creditsTransferred}</div>
                <div class="credits-label">Credits Added to Your Account</div>
              </div>
              
              <div class="balance-card">
                <div class="balance-row">
                  <span class="balance-label">Credits Transferred</span>
                  <span class="balance-value">+${creditsTransferred}</span>
                </div>
                <div class="balance-row">
                  <span class="balance-label">User Email</span>
                  <span class="balance-value">${userEmail}</span>
                </div>
                <div class="balance-row">
                  <span class="balance-label">New Balance</span>
                  <span class="balance-value new-balance">${newBalance} credits</span>
                </div>
              </div>
              
              <div class="features-section">
                <h3 class="features-title">What you can do with your credits:</h3>
                <div class="features-grid">
                  <div class="feature-item">
                    <div class="feature-icon">
                      <svg width="16" height="16" fill="#3b82f6" viewBox="0 0 24 24">
                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                    </div>
                    <span class="feature-text">AI Portfolio Analysis</span>
                  </div>
                  
                  <div class="feature-item">
                    <div class="feature-icon">
                      <svg width="16" height="16" fill="#10b981" viewBox="0 0 24 24">
                        <path d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                      </svg>
                    </div>
                    <span class="feature-text">Portfolio Cards Generation</span>
                  </div>
                  
                  <div class="feature-item">
                    <div class="feature-icon">
                      <svg width="16" height="16" fill="#8b5cf6" viewBox="0 0 24 24">
                        <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
                      </svg>
                    </div>
                    <span class="feature-text">Platform Integrations</span>
                  </div>
                  
                  <div class="feature-item">
                    <div class="feature-icon">
                      <svg width="16" height="16" fill="#f59e0b" viewBox="0 0 24 24">
                        <path d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/>
                      </svg>
                    </div>
                    <span class="feature-text">Career Insights & Tips</span>
                  </div>
                </div>
              </div>
              
              <div class="cta-section">
                <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard" class="cta-button">
                  <svg width="16" height="16" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/>
                  </svg>
                  Go to Dashboard
                </a>
              </div>
            </div>
            
            <div class="footer">
              <p class="footer-text">Thank you for using TrueFolio! 🚀</p>
              <p class="footer-text">If you have any questions, please contact our support team.</p>
            </div>
          </div>
        </body>
        </html>
      `,
			text: `
        Hi ${userName},
        
        ${process.env.NODE_ENV === 'development' ? `[DEV MODE] This email was sent to test address. Production would send to: ${userEmail}\n\n` : ''}
        
        Great news! Your credit transfer has been completed successfully.
        
        ${creditsTransferred} credits have been added to your TrueFolio account.
        Your new balance: ${newBalance} credits
        User Email: ${userEmail}
        
        You can now use these credits for premium features on TrueFolio.
        
        Visit your dashboard: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard
        
        Thank you for using TrueFolio!
        
        Best regards,
        TrueFolio Team
      `
		});

		if (error) {
			console.error('Email sending error:', error);
			throw new Error('Failed to send completion email');
		}

		return { success: true, messageId: data?.id };
	} catch (error) {
		console.error('Email sending error:', error);
		throw new Error('Failed to send completion email');
	}
} 