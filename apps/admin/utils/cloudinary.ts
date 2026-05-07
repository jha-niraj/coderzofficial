import crypto from 'crypto'

const CLOUDINARY_BASE = `https://api.cloudinary.com/v1_1/${process.env.CLOUDINARY_CLOUD_NAME}`

function sign(params: Record<string, string>): { signature: string; timestamp: number } {
    const timestamp = Math.round(Date.now() / 1000)
    const toSign = Object.entries({ ...params, timestamp: String(timestamp) })
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([k, v]) => `${k}=${v}`)
        .join('&') + process.env.CLOUDINARY_API_SECRET!
    const signature = crypto.createHash('sha1').update(toSign).digest('hex')
    return { signature, timestamp }
}

const cloudinary = {
    uploader: {
        upload_stream(
            options: { folder?: string; transformation?: unknown[]; timeout?: number },
            callback: (err: unknown, result?: { secure_url: string; public_id: string }) => void
        ) {
            // Return a writable stream-like interface
            const chunks: Buffer[] = []
            return {
                write(chunk: Buffer) { chunks.push(chunk) },
                end(finalChunk?: Buffer) {
                    if (finalChunk) chunks.push(finalChunk)
                    const buffer = Buffer.concat(chunks)
                    const folder = options.folder || ''
                    const { signature, timestamp } = sign({ folder })
                    const formData = new FormData()
                    formData.append('file', new Blob([buffer]))
                    formData.append('api_key', process.env.CLOUDINARY_API_KEY!)
                    formData.append('timestamp', String(timestamp))
                    formData.append('signature', signature)
                    if (folder) formData.append('folder', folder)
                    formData.append('transformation', 'c_fill,g_face,h_500,w_500/q_auto:good/f_auto')
                    fetch(`${CLOUDINARY_BASE}/image/upload`, { method: 'POST', body: formData })
                        .then(r => r.json())
                        .then((result: { secure_url?: string; public_id?: string; error?: { message: string } }) => {
                            if (result.error) callback(new Error(result.error.message))
                            else callback(null, { secure_url: result.secure_url!, public_id: result.public_id! })
                        })
                        .catch(err => callback(err))
                },
            }
        },
        async destroy(publicId: string): Promise<void> {
            const { signature, timestamp } = sign({ public_id: publicId })
            const formData = new FormData()
            formData.append('public_id', publicId)
            formData.append('api_key', process.env.CLOUDINARY_API_KEY!)
            formData.append('timestamp', String(timestamp))
            formData.append('signature', signature)
            await fetch(`${CLOUDINARY_BASE}/image/destroy`, { method: 'POST', body: formData })
        },
    },
}

export default cloudinary
