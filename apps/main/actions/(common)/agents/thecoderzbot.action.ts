'use server'

import OpenAI from 'openai';

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

export async function getOpenAIResponse(message: string) {
    try {
        const response = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                {
                    role: "user",
                    content: `Hey, you are an expert programmer and you need to explain this ${message} properly`,
                },
            ],
        });

        const assistantMessage = response.choices[0]?.message;

        if (!assistantMessage || !assistantMessage.content) {
            throw new Error("No response from assistant");
        }

        return assistantMessage.content;

    } catch (error) {
        console.error('Error calling OpenAI:', error);
        return 'Sorry, I encountered an error while processing your request.';
    }
}