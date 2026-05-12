export interface Author {
    name: string
    role: string
    avatar: string
    twitter?: string
    github?: string
}

export const authors: Record<string, Author> = {
    niraj: {
        name: "Niraj Jha",
        role: "Founder & Lead Engineer at BuildrHQ",
        avatar: "/mainlogo.png",
        twitter: "https://twitter.com/buildrhq",
        github: "https://github.com/jha-niraj",
    },
    buildrhq: {
        name: "BuildrHQ Team",
        role: "Engineering Intelligence Platform",
        avatar: "/mainlogo.png",
        twitter: "https://twitter.com/buildrhq",
    },
}
