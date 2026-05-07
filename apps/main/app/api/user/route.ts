import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@repo/auth';

export const PUT = async (req: NextRequest) => {
    const session = await getSession(req.headers);

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    // Request body parsing kept for future implementation
    await req.json();

    try {
        if (session?.user?.email) {
            // TODO: implement user update logic
            return NextResponse.json({ message: 'Not implemented' }, { status: 501 });
        } else {
            return NextResponse.json({ message: 'Email not found' }, { status: 401 });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
};
