"use server";

import { auth } from "@repo/auth";
import { prisma } from "@repo/prisma";
import Exa from "exa-js";
import OpenAI from "openai";
import { zodResponseFormat } from "openai/helpers/zod";
import { z } from "zod";
import { CoverLetterGenerationData } from "@/types/aitools/cover-letter";

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// Configure exa
const exa = new Exa("97e9842c-986c-4eb6-b23c-e065c3886445"); // As provided by user

export async function currentUser() {
    const session = await auth();
    return session?.user;
}

export async function extractJobDescription(url: string) {
    try {
        const user = await currentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const result = await exa.getContents([url], {
            highlights: true,
            livecrawlTimeout: 5000,
        });

        if (!result || !result.results || result.results.length === 0) {
            return { success: false, error: "Failed to extract job description. Try pasting it manually." };
        }

        const results = result.results || [];
        const firstResult = results[0];

        const highlights = firstResult?.highlights;
        const jd = typeof highlights === 'object' && highlights ? highlights.join("\n") : "";
        const title = firstResult?.title || "";

        return { success: true, description: jd, title: title };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to extract job description." };
    }
}

const QuestionsSchema = z.object({
    questions: z.array(z.object({
        id: z.string(),
        text: z.string(),
        type: z.enum(["TEXTAREA", "SINGLE", "MULTIPLE"]),
        options: z.array(z.string()).optional(), // Only for SINGLE/MULTIPLE
    }))
});

export async function generateCoverLetterQuestions(jobDescription: string) {
    try {
        const user = await currentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: `You are an expert technical recruiter and career coach. Review the provided Job Description and generate 3 to 5 targeted questions for the applicant. These questions should help customize their cover letter based on specific job requirements. The questions should ask for specific metrics, examples of experience with required tools, or how their past work aligns with core responsibilities. Output ONLY valid JSON matching the schema.`
                },
                {
                    role: "user",
                    content: `Job Description:\n\n${jobDescription}`
                }
            ],
            response_format: zodResponseFormat(QuestionsSchema, "questions_schema"),
        });

        const content = completion.choices[0]?.message?.content;
        let questions = [];
        if (content) {
            try {
                const parsed = JSON.parse(content);
                questions = parsed.questions || [];
            } catch (e) {
                console.error("Failed to parse JSON response:", e);
            }
        }

        return { success: true, questions };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to generate questions." };
    }
}

export async function generateAndSaveCoverLetter(data: CoverLetterGenerationData) {
    try {
        const user = await currentUser();
        if (!user) {
            return { success: false, error: "Unauthorized" };
        }

        // Fetch User profile
        const dbUser = await prisma.user.findUnique({
            where: { id: user.id },
            include: {
                skills: true,
                experiences: {
                    orderBy: { startDate: "desc" }
                },
                portfolioProjects: {
                    orderBy: { startDate: "desc" }
                },
            }
        });

        if (!dbUser) {
            return { success: false, error: "User not found" };
        }

        // Format user info
        let userInfoStr = `Name: ${dbUser.name || ''}\nEmail: ${dbUser.email || ''}\n\n`;

        if (dbUser.skills.length > 0) {
            userInfoStr += "Skills:\n";
            dbUser.skills.forEach(s => userInfoStr += `- ${s.name} (${s.level})\n`);
            userInfoStr += "\n";
        }

        if (dbUser.experiences.length > 0) {
            userInfoStr += "Work Experience:\n";
            dbUser.experiences.forEach(e => {
                userInfoStr += `- ${e.roleTitle} at ${e.companyName} (${e.startDate.toISOString().split('T')[0]} to ${e.isCurrentlyWorking ? 'Present' : e.endDate?.toISOString().split('T')[0]})\n`;
                if (e.bulletPoints && e.bulletPoints.length > 0) {
                    e.bulletPoints.forEach(b => userInfoStr += `  * ${b}\n`);
                }
            });
            userInfoStr += "\n";
        }

        if (dbUser.portfolioProjects.length > 0) {
            userInfoStr += "Projects:\n";
            dbUser.portfolioProjects.forEach(p => {
                userInfoStr += `- ${p.projectName} (${p.technologies.join(', ')})\n`;
                if (p.bulletPoints && p.bulletPoints.length > 0) {
                    p.bulletPoints.forEach(b => userInfoStr += `  * ${b}\n`);
                }
            });
            userInfoStr += "\n";
        }

        // Format Q&A
        let qaStr = "Applicant Responses to Targeted Questions:\n";
        data.questions.forEach(q => {
            let answer = data.answers[q.id] || "No answer provided.";
            if (Array.isArray(answer)) {
                answer = answer.join(", ");
            }
            qaStr += `Q: ${q.text}\nA: ${answer}\n\n`;
        });

        const prompt = `
            You are an expert career coach writing a highly compelling, professional, yet personalized cover letter.
            Write a cover letter using markdown format.

            Context:
            Job Title: ${data.jobTitle}
            Company: ${data.companyName}
            Tone: ${data.tone}

            Job Description:
            ${data.jobDescription}

            Applicant Profile:
            ${userInfoStr}

            ${qaStr}

            Instructions:
            1. Do not include placeholders like "[Your Name]" if possible, use the applicant profile.
            2. Structure it well: header, greeting, strong opening, well-articulated body paragraphs highlighting specific relevant achievements based on the applicant profile and their answers, and a call-to-action closing.
            3. Be concise (max 3-4 paragraphs) and directly map the applicant's experience to the specific needs found in the job description.
            4. Include relevant links (e.g. to projects) if they are in the profile or answers.
            5. Return ONLY markdown content. No preamble.
            `
            ;

        const completion = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "system",
                    content: "You are an expert copywriter and career coach."
                },
                {
                    role: "user",
                    content: prompt
                }
            ],
            temperature: 0.7,
        });

        const generatedContent = completion?.choices?.[0]?.message?.content || "";

        // Save to DB
        const letter = await prisma.coverLetter.create({
            data: {
                userId: user.id,
                jobUrl: data.jobUrl,
                companyName: data.companyName,
                jobTitle: data.jobTitle,
                jobDescription: data.jobDescription,
                tone: data.tone,
                questions: data.questions as any,
                answers: data.answers as any,
                generatedContent,
            }
        });

        return { success: true, coverLetterId: letter.id, content: generatedContent };

    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to generate cover letter." };
    }
}

export async function getCoverLetters() {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const letters = await prisma.coverLetter.findMany({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" },
            select: {
                id: true,
                companyName: true,
                jobTitle: true,
                createdAt: true,
            }
        });

        return { success: true, coverLetters: letters };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to get cover letters" };
    }
}

export async function getCoverLetter(id: string) {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "Unauthorized" };

        const letter = await prisma.coverLetter.findUnique({
            where: { id, userId: user.id }
        });

        if (!letter) return { success: false, error: "Not found" };

        return { success: true, coverLetter: letter };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to get cover letter" };
    }
}

export async function deleteCoverLetter(id: string) {
    try {
        const user = await currentUser();
        if (!user) return { success: false, error: "Unauthorized" };

        await prisma.coverLetter.delete({
            where: { id, userId: user.id }
        });

        return { success: true };
    } catch (e: unknown) {
        return { success: false, error: e instanceof Error ? e.message : "Failed to delete" };
    }
}