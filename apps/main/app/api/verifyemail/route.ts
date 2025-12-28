import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@repo/prisma";
import { sendEmail } from "@/utils/mail";

export async function POST(request: NextRequest) {
    try {
        const reqBody = await request.json();
        const { token } = reqBody;

        const user = await prisma.user.findFirst({
            where: {
                verifyToken: token,
                verifyTokenExpiry: {
                    gt: new Date()
                }
            }
        })

        if (!user) {
            return NextResponse.json({ message: "Invalid token" }, { status: 501 });
        }

        const verifyResponse = await prisma.user.update({
            where: {
                id: user?.id
            },
            data: {
                emailVerified: true,
                verifyToken: null,
                verifyTokenExpiry: null
            }
        })

        if (!verifyResponse) {
            return NextResponse.json({ message: "Email verification failed" }, { status: 501 });
        }

        await sendEmail({ name: user.name ?? '', email: user.email, emailType: "WELCOME" });

        return NextResponse.json({
            message: "Email verification successful",
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        }, { status: 200 });
    } catch (err: unknown) {
        const error = err instanceof Error ? err : new Error('Unknown error');
        console.log("Error while verifying user: " + error.message);
        return NextResponse.json({ message: "Error while verifying user!!!" }, { status: 501 });
    }
}
