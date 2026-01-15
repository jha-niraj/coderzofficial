'use server'

import cloudinary from '@/utils/cloudinary'
import { getServerSession } from '@repo/auth'
import { authOptions } from '@repo/auth'

export async function uploadCommunityImage(formData: FormData): Promise<{
    success: boolean
    url?: string
    error?: string
}> {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const file = formData.get('file') as File | null
        const folder = formData.get('folder') as string || 'communities'

        if (!file) {
            return { success: false, error: 'No file provided' }
        }

        // Convert file to buffer
        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Upload to Cloudinary
        const result = await new Promise<{ secure_url: string }>((resolve, reject) => {
            cloudinary.uploader.upload_stream(
                {
                    folder: `coderzofficial/${folder}`,
                    resource_type: 'image',
                    transformation: [
                        { width: 1200, height: 1200, crop: 'limit' },
                        { quality: 'auto' },
                        { fetch_format: 'auto' }
                    ]
                },
                (error, result) => {
                    if (error) reject(error)
                    else resolve(result as { secure_url: string })
                }
            ).end(buffer)
        })

        return {
            success: true,
            url: result.secure_url
        }
    } catch (error) {
        console.error('Error uploading image:', error)
        return { success: false, error: 'Failed to upload image' }
    }
}

export async function uploadMultipleImages(
    formData: FormData
): Promise<{
    success: boolean
    urls?: string[]
    error?: string
}> {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.id) {
            return { success: false, error: 'Unauthorized' }
        }

        const files = formData.getAll('files') as File[]
        const folder = formData.get('folder') as string || 'communities'

        if (!files || files.length === 0) {
            return { success: false, error: 'No files provided' }
        }

        const uploadPromises = files.map(async (file) => {
            const bytes = await file.arrayBuffer()
            const buffer = Buffer.from(bytes)

            return new Promise<string>((resolve, reject) => {
                cloudinary.uploader.upload_stream(
                    {
                        folder: `coderzofficial/${folder}`,
                        resource_type: 'image',
                        transformation: [
                            { width: 1200, height: 1200, crop: 'limit' },
                            { quality: 'auto' },
                            { fetch_format: 'auto' }
                        ]
                    },
                    (error, result) => {
                        if (error) reject(error)
                        else resolve((result as { secure_url: string }).secure_url)
                    }
                ).end(buffer)
            })
        })

        const urls = await Promise.all(uploadPromises)

        return {
            success: true,
            urls
        }
    } catch (error) {
        console.error('Error uploading images:', error)
        return { success: false, error: 'Failed to upload images' }
    }
}
