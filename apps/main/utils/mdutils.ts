import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

export async function getMarkdownContent(filename: string) {
    // Use dynamic import for reading the file
    const fileContents = await import(`!!raw-loader!../(execlusives)/buildxscratch/projectdata/${filename}`);

    // Use gray-matter to parse the metadata section
    const matterResult = matter(fileContents.default);

    // Use remark to convert markdown into HTML string
    const processedContent = await remark()
        .use(html)
        .process(matterResult.content);
    const contentHtml = processedContent.toString();

    return {
        contentHtml,
        ...matterResult.data
    };
}