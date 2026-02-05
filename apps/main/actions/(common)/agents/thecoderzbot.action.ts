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


// 'use server'

// import OpenAI from 'openai';

// // Initialize OpenAI client
// const openai = new OpenAI({
//     apiKey: process.env.OPEN_AI_KEY,
// });

// const ASSISTANT_ID = process.env.HELPBOT_ASSISTANT_ID;

// export async function getOpenAIResponse(message: string) {
//     try {
//         const thread = await openai.beta.threads.create();
//         await openai.beta.threads.messages.create(thread.id, {
//             role: "user",
//             content: message
//         });
//         const run = await openai.beta.threads.runs.create(thread.id, {
//             assistant_id: ASSISTANT_ID!,
//         });

//         let runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

//         while (runStatus.status !== "completed") {
//             await new Promise(resolve => setTimeout(resolve, 1000));
//             runStatus = await openai.beta.threads.runs.retrieve(thread.id, run.id);

//             if (runStatus.status === "failed") {
//                 throw new Error("Assistant run failed");
//             }

//             if (runStatus.status === "expired" || runStatus.status === "cancelled") {
//                 throw new Error(`Assistant run ${runStatus.status}`);
//             }
//         }

//         const messages = await openai.beta.threads.messages.list(thread.id);

//         const lastMessage = messages.data
//             .filter(message => message.role === "assistant")
//             .pop();

//         if (!lastMessage || !lastMessage.content[0]) {
//             throw new Error("No response from assistant");
//         }

//         const contentBlock = lastMessage.content[0];
//         if ("text" in contentBlock) {
//             return contentBlock.text.value;
//         } else {
//             throw new Error("The assistant's response is not a text message.");
//         }

//     } catch (error) {
//         console.error('Error calling OpenAI:', error);
//         return 'Sorry, I encountered an error while processing your request.';
//     }
// }