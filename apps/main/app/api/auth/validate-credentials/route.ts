import { NextResponse } from "next/server"

export async function GET() {
    return NextResponse.json({ message: "Handled by BetterAuth at /api/auth" })
}

export async function POST() {
    return NextResponse.json({ message: "Handled by BetterAuth at /api/auth" })
}
