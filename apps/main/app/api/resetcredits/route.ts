import { NextResponse } from "next/server";
import { prisma } from "@repo/prisma";

export async function GET() {
    try {
        const result = await prisma.user.updateMany({
            data: {
                creditsShared: 0,
            },
        });

        console.log(`Reset creditsShared for ${result.count} users.`);
        return NextResponse.json({ success: true, count: result.count });
    } catch (err) {
        const error = err as Error;
        console.log("Error resetting creditsShared:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    } finally {
        await prisma.$disconnect();
    }
}