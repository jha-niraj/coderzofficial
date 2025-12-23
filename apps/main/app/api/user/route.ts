// import { updateUser } from '@/app/data/user';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/auth';

export const PUT = async (req: NextRequest) => {
    const session = await auth();

    if (!session) {
        return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { name, email, interestedIn, interestedInTime, tagline, bio, image } = await req.json();
    // console.log(interestedInTime);
    try {
        if (session?.user?.email) {

            // const updatedUser = updateUser(session.user.email, {
            //     name,
            //     email,
            //     interestedIn,
            //     interestedInTime,
            //     tagline,
            //     bio,
            //     image,
            // });

            // return NextResponse.json(updatedUser, { status: 200 });
        }
        else {
            return NextResponse.json({ message: 'Email not found' }, { status: 401 });
        }
    } catch (error) {
        console.error('Error updating user:', error);
        return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
    }
};