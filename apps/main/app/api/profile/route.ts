import { db, users } from "@repo/db";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@repo/auth";

export async function GET(req: NextRequest) {
    const session = await getSession(req.headers);

    if (!session || !session?.user) {
        return NextResponse.json({ msg: "User is not authenticated" }, { status: 403 });
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email as string),
            columns: {
                bio: true,
                gender: true,
                phone: true,
                yearofbirth: true,
                university: true,
                location: true,
                website: true,
                interests: true,
            },
        });

        if (!user) {
            return NextResponse.json({ msg: "User not found" }, { status: 404 });
        }

        return NextResponse.json({ data: user }, { status: 200 });
    } catch (err: unknown) {
        console.log("Error while fetching user data" + err);
        return NextResponse.json({ msg: "Error while fetching user data" }, { status: 501 });
    }
}
