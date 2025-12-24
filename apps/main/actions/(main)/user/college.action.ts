"use server"

import prisma from "@repo/prisma"

export async function getColleges() {
    try {
        const colleges = await prisma.user.findMany({
            where: {
                university: {
                    not: null
                }
            },
            select: {
                university: true
            },
            distinct: ['university']
        })

        const uniqueColleges = [...new Set(colleges.map((c: any) => c.university).filter(Boolean))] as string[]
        return { success: true, colleges: uniqueColleges.sort() }
    } catch (error) {
        console.error('Error fetching colleges:', error)
        return { success: false, colleges: [] }
    }
}

export async function getCompanies() {
    try {
        const companies = await prisma.user.findMany({
            where: {
                company: {
                    not: null
                }
            },
            select: {
                company: true
            },
            distinct: ['company']
        })

        const uniqueCompanies = [...new Set(companies.map((c: any) => c.company).filter(Boolean))] as string[]
        return { success: true, companies: uniqueCompanies.sort() }
    } catch (error) {
        console.error('Error fetching companies:', error)
        return { success: false, companies: [] }
    }
}