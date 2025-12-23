import { PutObjectCommand, S3Client, PutObjectCommandInput } from '@aws-sdk/client-s3';

interface EnvVars {
    S3_REGION: string;
    S3_ACCESS_KEY: string;
    S3_SECRET_KEY: string;
    S3_BUCKET_NAME: string;
}

declare const process: {
    env: EnvVars;
};
const s3Client = new S3Client({
    region: process.env.S3_REGION,
    credentials: {
        accessKeyId: process.env.S3_ACCESS_KEY,
        secretAccessKey: process.env.S3_SECRET_KEY,
    },
});

export function getObjectUrl(fileName: string): string {
    if (!process.env.S3_BUCKET_NAME || !process.env.S3_REGION) {
        throw new Error('Missing required S3 configuration');
    }
    return `https://${process.env.S3_BUCKET_NAME}.s3.${process.env.S3_REGION}.amazonaws.com/${fileName}`;
}

export async function uploadFile(
    file: Buffer | Blob | Uint8Array,
    fileName: string,
    fileType: string
): Promise<void> {
    if (!process.env.S3_BUCKET_NAME) {
        throw new Error('S3_BUCKET_NAME is not defined');
    }

    try {
        const commandInput: PutObjectCommandInput = {
            Bucket: process.env.S3_BUCKET_NAME,
            Key: fileName,
            ContentType: fileType,
            Body: file,
        };

        const command = new PutObjectCommand(commandInput);
        await s3Client.send(command);
    } catch (error: any) {
        console.error('S3 upload error:', error);
        throw new Error(`Failed to upload to S3: ${error.message}`);
    }
}