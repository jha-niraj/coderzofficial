"use server"

import { db, users } from "@repo/db"
import { isNotNull, sql } from "drizzle-orm"

export async function getColleges() {
    try {
        const rows = await db
            .selectDistinct({ university: users.university })
            .from(users)
            .where(isNotNull(users.university))

        const uniqueColleges = rows
            .map((r) => r.university)
            .filter(Boolean) as string[]

        return { success: true, colleges: uniqueColleges.sort() }
    } catch (error) {
        console.error('Error fetching colleges:', error)
        return { success: false, colleges: [] }
    }
}

export async function getCompanies() {
    // Static list of popular tech companies
    const popularCompanies = [
        // FAANG/MAANG
        "Google", "Meta", "Amazon", "Apple", "Netflix", "Microsoft",
        // Indian Tech Giants
        "Infosys", "TCS", "Wipro", "HCL Technologies", "Tech Mahindra", "L&T Infotech",
        // Startups & Unicorns (India)
        "Flipkart", "Razorpay", "Zerodha", "CRED", "Swiggy", "Zomato", "Ola",
        "PhonePe", "Paytm", "Meesho", "Groww", "Byju's", "Unacademy",
        "Dream11", "Postman", "Freshworks", "Zoho", "Chargebee", "BrowserStack",
        // US Tech Companies
        "Uber", "Airbnb", "Stripe", "Shopify", "Salesforce", "Adobe", "Oracle",
        "IBM", "Intel", "Nvidia", "AMD", "Qualcomm", "Cisco", "VMware",
        // Fintech
        "Goldman Sachs", "Morgan Stanley", "JP Morgan", "Deutsche Bank", "Barclays",
        // Product Companies
        "Atlassian", "Slack", "Notion", "Figma", "Canva", "GitLab", "GitHub",
        "Databricks", "Snowflake", "Cloudera", "Splunk", "Datadog", "MongoDB",
        // Consulting
        "Deloitte", "PwC", "EY", "KPMG", "Accenture", "McKinsey", "BCG",
        // Gaming
        "Rockstar Games", "Electronic Arts", "Ubisoft", "Unity",
        // AI/ML Companies
        "OpenAI", "Anthropic", "DeepMind", "Cohere", "Stability AI", "Hugging Face",
        // Remote-First
        "Gitlab", "Zapier", "Buffer", "Automattic", "Toptal", "Turing",
        // Others
        "Twitter/X", "LinkedIn", "Pinterest", "Snapchat", "Spotify", "Twilio",
        "Square", "Block", "Coinbase", "Binance", "Polygon", "Ripple"
    ]

    try {
        // Get companies from database (user's current employers)
        const rows = await db
            .selectDistinct({ company: users.company })
            .from(users)
            .where(isNotNull(users.company))

        const dbCompanies = rows
            .map((r) => r.company)
            .filter(Boolean) as string[]

        // Merge and deduplicate
        const allCompanies = [...new Set([...popularCompanies, ...dbCompanies])]

        return { success: true, companies: allCompanies.sort() }
    } catch (error) {
        console.error('Error fetching companies:', error)
        // Return static list even if DB fails
        return { success: true, companies: popularCompanies.sort() }
    }
}
