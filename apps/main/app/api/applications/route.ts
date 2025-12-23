import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
    try {
        const { name, email, phonenumber, github, linkedin, position, coverletter } = await req.json();

        const checkIfApplicationAlreadySubmitted = await prisma.applications.findFirst({
            where: {
                email
            }
        })
        if(checkIfApplicationAlreadySubmitted) {
            return NextResponse.json({ msg: "Application already submitted with this email" }, { status: 403 });
        }

        if(!name || !email || ! phonenumber || !github || !linkedin || !position || !coverletter) {
            return NextResponse.json({ msg: "Please fill all the fields" }, { status: 503 });
        }

        const response = await prisma.applications.create({
            data: {
                name,
                email,
                github,
                linkedin,
                position,
                coverletter
            }
        })

        if(!response) {
            return NextResponse.json({ msg: "Failed to submit the application, please try again" }, { status: 501 });
        }
        return NextResponse.json({ msg: "Application submitted successfully", response }, { status: 200 });
    } catch (err: any) {
        console.log("Error while submitting application: " + err);
        return NextResponse.json({ msg: "Error while submitting application" }, { status: 501 });
    }
}