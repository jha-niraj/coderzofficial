import { prisma } from "@repo/prisma";
import { NextRequest, NextResponse } from "next/server";
import { auth } from '@repo/auth';

export async function GET(req: NextRequest) {
    if (req.method !== 'GET') {
        return NextResponse.json({ msg: "Method not allowed" }, { status: 501 });
    }

    const session = await auth();

    if (!session || !session?.user) {
        return NextResponse.json({ msg: "User is not authenticated" }, { status: 403 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: session?.user?.email as string
            },
            select: {
                bio: true,
                gender: true,
                phone: true,
                yearofbirth: true,
                university: true,
                location: true,
                socials: true,
                website: true,
                interests: true,
                skills: true,
                proofofwork: true
            }
        })

        if (!user) {
            return NextResponse.json({ msg: "User not found" }, { status: 404 })
        }

        return NextResponse.json({ data: user }, { status: 200 });
    } catch (err: unknown) {
        console.log("Error while fetching user data" + err);
        return NextResponse.json({ msg: "Error while fetching user data" }, { status: 501 });
    }
}