import {
    S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand
} from "@aws-sdk/client-s3"
import { getSignedUrl } from "@aws-sdk/s3-request-presigner"

const R2_ACCOUNT_ID = process.env.R2_ACCOUNT_ID
const R2_BUCKET_NAME = process.env.R2_BUCKET_NAME || "user-documents"

function createR2Client() {
    return new S3Client({
        region: "auto",
        endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
        credentials: {
            accessKeyId: process.env.R2_ACCESS_KEY_ID!,
            secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
        },
    })
}

export async function uploadToR2(params: {
    key: string
    body: Buffer | Uint8Array
    contentType: string
    metadata?: Record<string, string>
}): Promise<void> {
    const client = createR2Client()
    await client.send(new PutObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: params.key,
        Body: params.body,
        ContentType: params.contentType,
        Metadata: params.metadata,
    }))
}

export async function deleteFromR2(key: string): Promise<void> {
    const client = createR2Client()
    await client.send(new DeleteObjectCommand({
        Bucket: R2_BUCKET_NAME,
        Key: key,
    }))
}

export async function getR2SignedUrl(key: string, expiresIn = 7 * 24 * 60 * 60): Promise<string> {
    const client = createR2Client()
    const command = new GetObjectCommand({ Bucket: R2_BUCKET_NAME, Key: key })
    return getSignedUrl(client, command, { expiresIn })
}

export function isR2Configured(): boolean {
    return !!(
        process.env.R2_ACCOUNT_ID &&
        process.env.R2_ACCESS_KEY_ID &&
        process.env.R2_SECRET_ACCESS_KEY
    )
}
