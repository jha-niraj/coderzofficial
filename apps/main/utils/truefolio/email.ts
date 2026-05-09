import { creditEmailTemplates, sendCreditEmail } from "@/lib/emails/creditemail";

export async function sendTransferVerificationEmail(
    userEmail: string,
    userName: string,
    transferId: string,
    creditsRequested: number,
    verificationToken: string,
) {
    const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/verify?token=${verificationToken}`;

    const targetEmail =
        process.env.NODE_ENV === "development"
            ? "shunyatechofficial@gmail.com"
            : userEmail;

    const template = creditEmailTemplates.transferVerification(
        userName,
        creditsRequested,
        transferId,
        verificationUrl,
        process.env.NODE_ENV === "development" ? userEmail : undefined,
    );

    return sendCreditEmail(targetEmail, template);
}

export async function sendTransferCompletionEmail(
    userEmail: string,
    userName: string,
    creditsTransferred: number,
    newBalance: number,
) {
    const targetEmail =
        process.env.NODE_ENV === "development"
            ? "shunyatechofficial@gmail.com"
            : userEmail;

    const template = creditEmailTemplates.transferCompleted(
        userName,
        creditsTransferred,
        newBalance,
    );

    return sendCreditEmail(targetEmail, template);
}
