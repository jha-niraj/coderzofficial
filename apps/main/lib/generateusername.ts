import { db, users } from "@repo/db";
import { eq } from "drizzle-orm";

function slugifyName(name: string) {
    return name.toLowerCase().replace(/\s+/g, "");
}

const platformTags = [
    "coderz", "bravo", "cwords", "devs", "hackers", "geeks", "programmers", "techies", "innovators", "builders",
    "creators", "makers", "problemSolvers", "coders", "nerds", "engineers", "designers", "developers", "architects"
];

function getRandomTag() {
    const index = Math.floor(Math.random() * platformTags.length);
    return platformTags[index];
}

export async function generateUniqueUsername(name: string): Promise<string> {
    const baseUsername = slugifyName(name);
    let username = `${baseUsername}${getRandomTag()}`;
    let counter = 1;

    while (true) {
        const existing = await db.select({ id: users.id }).from(users).where(eq(users.username, username)).limit(1);
        if (existing.length === 0) break;
        username = `${baseUsername}${getRandomTag()}${counter}`;
        counter++;
    }

    return username;
}
