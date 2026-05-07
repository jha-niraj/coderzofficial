import { NextResponse } from "next/server";
import { db, users } from "@repo/db";

export async function GET() {
    try {
        const result = await db.update(users)
            .set({ creditsShared: 0 });

        // Drizzle update does not return a count by default; use a raw count query if needed
        console.log(`Reset creditsShared for all users.`);
        return NextResponse.json({ success: true });
    } catch (err) {
        const error = err as Error;
        console.log("Error resetting creditsShared:", error);
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }
}
