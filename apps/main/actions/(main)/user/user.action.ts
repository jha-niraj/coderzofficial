"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import { SkillCategory } from "@prisma/client"
import { ContactInfo, UserCertification, UserProfile, UserSkill } from "@/types/user"

export async function getUserProfile() {
    const session = await auth()

    if (!session?.user?.email) {
        throw new Error("User not authenticated")
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email
        },
        include: {
            skills: true,
            certifications: true
        }
    })

    if (!user) {
        throw new Error("User not found")
    }

    return {
        id: user.id,
        username: user?.username,
        name: user.name || "",
        email: user.email,
        emailVerified: user.emailVerified ?? undefined,
        image: user.image || "",
        role: user.role,
        hasResume: user?.hasResume,
        resume: user?.resume,
        bio: user.bio || "",
        university: user.university || "",
        location: user.location || "",
        company: "",
        createdAt: user?.createdAt,
        occupation: user?.occupation || "",
        website: user?.website || "",
        socials: user.socials as any || {},
        skills: user.skills.map(skill => ({
            id: skill.id,
            name: skill.name,
            level: skill.level,
            category: skill.category
        })),
        certifications: user.certifications.map(cert => ({
            id: cert.id,
            name: cert.name,
            issuer: cert.issuer,
            issuedDate: cert.issuedDate,
            link: cert.link
        })),
        contactInfo: {
            phone: user?.phone,
            gender: user?.gender,
            yearofbirth: user?.yearofbirth
        } as ContactInfo,
        credits: user?.credits,
        xp: user?.currentXp,
        creditsShared: user?.creditsShared,
        maxCreditsShared: user?.maxCreditsShared
    }
}
export async function updateUserProfile(data: Partial<UserProfile>) {
    const session = await auth()

    if (!session?.user?.email) {
        throw new Error("User not authenticated")
    }

    const userUpdateData: any = {
        name: data.name,
        bio: data.bio,
        gender: data.contactInfo?.gender,
        phone: data.contactInfo?.phone,
        yearofbirth: data.contactInfo?.yearofbirth,
        university: data.university,
        company: data.company,
        occupation: data.occupation,
        location: data.location,
        website: data.website,
        image: data.image,
        socials: data.socials as any
    }

    const updatedUser = await prisma.user.update({
        where: {
            email: session.user.email
        },
        data: userUpdateData,
        include: {
            skills: true,
            certifications: true
        }
    })

    revalidatePath('/profile')

    return {
        id: updatedUser.id,
        username: updatedUser?.username,
        name: updatedUser.name || "",
        email: updatedUser.email,
        emailVerified: updatedUser.emailVerified ?? undefined,
        image: updatedUser.image || "",
        role: updatedUser.role,
        gender: updatedUser.gender || "",
        phone: updatedUser.phone || "",
        yearofbirth: updatedUser.yearofbirth || "",
        bio: updatedUser.bio || "",
        university: updatedUser.university || "",
        location: updatedUser.location || "",
        xp: updatedUser.currentXp,
        credits: updatedUser.credits,
        socials: updatedUser.socials as any || {},
        socialLinks: updatedUser.socials as any || {},
        website: "",
        occupation: "",
        createdAt: updatedUser.createdAt,
        skills: updatedUser.skills.map(skill => ({
            id: skill.id,
            name: skill.name,
            level: skill.level,
            category: skill.category
        })) as UserSkill[],
        certifications: updatedUser.certifications.map(cert => ({
            id: cert.id,
            name: cert.name,
            issuer: cert.issuer,
            issuedDate: cert.issuedDate as Date,
            link: cert.link
        })) as UserCertification[],
        contactInfo: {
            phone: updatedUser?.phone,
            gender: updatedUser?.gender,
            yearofbirth: updatedUser?.yearofbirth
        } as ContactInfo
    }
}
export async function updateUserSkills(skills: UserSkill[]) {
    const session = await auth()

    if (!session?.user?.email) {
        throw new Error("User not authenticated")
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email
        },
        select: { id: true }
    })

    if (!user) {
        throw new Error("User not found")
    }

    for (const skill of skills) {
        if (skill.id) {
            await prisma.skills.update({
                where: {
                    id: skill.id
                },
                data: {
                    name: skill.name,
                    level: typeof skill.level === 'number' ? String(skill.level) : skill.level,
                    category: skill.category || SkillCategory.FRONTEND,
                }
            })
        } else {
            await prisma.skills.create({
                data: {
                    name: skill.name,
                    level: typeof skill.level === 'number' ? String(skill.level) : skill.level,
                    category: skill.category || SkillCategory.FRONTEND,
                    userId: user.id
                }
            })
        }
    }

    const updatedUser = await prisma.user.findUnique({
        where: {
            email: session.user.email
        },
        include: {
            skills: true,
            certifications: true
        }
    })

    if (!updatedUser) {
        throw new Error("Failed to fetch updated user")
    }

    revalidatePath('/profile')

    return updatedUser.skills.map(skill => ({
        id: skill.id,
        name: skill.name,
        level: skill.level,
        category: skill.category
    })) as UserSkill[]
}
export async function updateUserCertifications(certifications: UserCertification[]) {
    const session = await auth()

    if (!session?.user?.email) {
        throw new Error("User not authenticated")
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email
        },
        select: { id: true }
    })

    if (!user) {
        throw new Error("User not found")
    }

    for (const cert of certifications) {
        if (cert.id) {
            await prisma.certifications.update({
                where: {
                    id: cert.id
                },
                data: {
                    name: cert.name,
                    issuer: cert.issuer,
                    issuedDate: cert.issuedDate,
                    link: cert.link || "",
                }
            })
        } else {
            await prisma.certifications.create({
                data: {
                    name: cert.name,
                    issuer: cert.issuer,
                    issuedDate: cert.issuedDate!,
                    link: cert.link || "",
                    userId: user.id
                }
            })
        }
    }

    const updatedUser = await prisma.user.findUnique({
        where: {
            email: session.user.email
        },
        include: {
            skills: true,
            certifications: true
        }
    })

    if (!updatedUser) {
        throw new Error("Failed to fetch updated user")
    }

    revalidatePath('/profile')

    return updatedUser.certifications.map(cert => ({
        id: cert.id,
        name: cert.name,
        issuer: cert.issuer,
        issuedDate: cert.issuedDate,
        link: cert.link
    })) as UserCertification[]
}
export async function updateContactInfo(contactData: ContactInfo) {
    const session = await auth()

    if (!session?.user?.email) {
        throw new Error("User not authenticated")
    }

    const user = await prisma.user.findUnique({
        where: {
            email: session.user.email
        },
        select: { id: true }
    })

    if (!user) {
        throw new Error("User not found")
    }

    const updatedUser = await prisma.user.update({
        where: {
            id: session?.user?.id
        },
        data: {
            phone: contactData.phone,
            gender: contactData.gender,
            yearofbirth: contactData.yearofbirth
        }
    })

    if (!updatedUser) {
        throw new Error("Failed to fetch updated user")
    }

    revalidatePath('/profile')

    return {
        phone: updatedUser.phone,
        gender: updatedUser.gender,
        yearofbirth: updatedUser.yearofbirth,
    }
}
export async function getUserReferralCode() {
    const session = await auth();
    if (!session) {
        return null;
    }

    try {
        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email,
            },
            select: {
                referralCode: true,
                referralCount: true,
            },
        });
        if (!user) {
            return {
                success: false,
                message: "No user found"
            }
        }

        return {
            success: true,
            data: {
                referralCode: user.referralCode,
                referralCount: user.referralCount,
            }
        }
    } catch (err) {
        const error = err as Error;
        console.log("Error occurred while getting the referral code: " + error);
        throw new Error("Error occurred while getting the referral code");
    }
}
export async function checkUsername(username: string) {
    if (!username || username.length < 3) return false;

    const user = await prisma.user.findUnique({
        where: {
            username: username.toLowerCase(),
        },
    });

    return user === null;
}
export async function updateUsername(newUsername: string) {
    const session = await auth();

    if (!session?.user) {
        return { success: false, message: "Unauthorized" };
    }

    const userId = session.user.id;

    try {
        const updatedUser = await prisma.user.update({
            where: {
                id: userId,
            },
            data: {
                username: newUsername.toLowerCase(),
            },
        });

        return { success: true, message: "Username updated successfully", updatedUsername: updatedUser?.username };
    } catch (error: any) {
        console.error("Update error:", error);
        return { success: false, message: "Failed to update username" };
    }
}
export async function searchUsers(query: string) {
    const users = await prisma.user.findMany({
        where: {
            username: {
                contains: query,
                mode: "insensitive",
            },
        },
        select: {
            id: true,
            username: true,
            name: true,
            image: true,
            credits: true
        },
    })
    return users
}
export async function getUserByEmail(email: string) {
    try {
        const user = await prisma.user.findUnique({
            where: { email },
            select: {
                id: true,
                name: true,
                email: true,
                username: true,
                image: true,
                bio: true,
                university: true,
                company: true,
                occupation: true,
                location: true,
                website: true,
                socials: true,
                interests: true,
                currentXp: true,
                totalXp: true,
                currentLevel: true,
                credits: true,
                createdAt: true,
                skills: {
                    select: {
                        name: true,
                        level: true,
                        category: true,
                    },
                },
                certifications: {
                    select: {
                        name: true,
                        issuer: true,
                        issuedDate: true,
                        link: true,
                    },
                },
            },
        });

        if (!user) {
            throw new Error("User not found");
        }

        return {
            user: {
                ...user,
                xp: user.currentXp,
            },
        };
    } catch (error) {
        console.error("Error fetching user:", error);
        throw new Error("Failed to fetch user");
    }
}

export async function updateUserResume(file: File) {
    try {
        const session = await auth()
        if (!session?.user?.id) {
            return { success: false, error: "Not authenticated" }
        }

        // For now, we'll just update the database fields
        // In a production app, you'd want to upload to cloud storage
        const formData = new FormData()
        formData.append('file', file)
        
        // Simple mock upload - in reality you'd upload to S3/Cloudinary/etc
        const mockUrl = `https://example.com/resumes/${session.user.id}/${file.name}`
        
        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                hasResume: true,
                resume: mockUrl,
                // You might also want to extract text from the file and store it
                // resumeText: extractedText
            }
        })

        revalidatePath('/profile')
        revalidatePath('/ai/jobinterviewassistant')
        
        return { success: true }
    } catch (error) {
        console.error("Error updating resume:", error)
        return { success: false, error: "Failed to update resume" }
    }
}