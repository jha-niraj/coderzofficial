import { remark } from 'remark'
import remarkGfm from 'remark-gfm'
import remarkHtml from 'remark-html'
import fs from 'fs'
import path from 'path'

export async function getPostContent(slug: string): Promise<string> {
    const filePath = path.join(process.cwd(), 'content', 'posts', `${slug}.md`)
    if (!fs.existsSync(filePath)) return ''
    const raw = fs.readFileSync(filePath, 'utf-8')
    const result = await remark().use(remarkGfm).use(remarkHtml, { sanitize: false }).process(raw)
    return result.toString()
}
