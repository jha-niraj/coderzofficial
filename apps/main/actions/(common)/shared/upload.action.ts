"use server"

import cloudinary from "@/utils/cloudinary";
import { auth } from '@repo/auth';

interface CloudinaryUploadResult {
    secure_url: string;
    public_id: string;
    // Add other properties if needed
}

export async function uploadImageToCloudinary(formData: FormData) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required", url: null };
        }

        const file = formData.get('file') as File;
        if (!file) {
            return { success: false, message: "No file provided", url: null };
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            return { 
                success: false, 
                message: "Invalid file type. Please upload JPG, PNG, or WebP images.", 
                url: null 
            };
        }

        // Validate file size (max 5MB)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return { 
                success: false, 
                message: "File size too large. Please upload images smaller than 5MB.", 
                url: null 
            };
        }

        // Convert file to buffer
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        // Upload to Cloudinary with timeout
        const uploadPromise = new Promise<CloudinaryUploadResult>((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                {
                    folder: "thecoderz/profile-pictures",
                    transformation: [
                        { width: 500, height: 500, crop: "fill", gravity: "face" },
                        { quality: "auto:good" },
                        { format: "auto" }
                    ],
                    timeout: 60000 // 60 seconds timeout
                },
                (error, result) => {
                    if (error) {
                        console.error("Cloudinary upload error:", error);
                        reject(error);
                    } else if (result) {
                        resolve(result as CloudinaryUploadResult);
                    } else {
                        reject(new Error("Upload failed - no result returned"));
                    }
                }
            );
            uploadStream.end(buffer);
        });

        // Add a timeout wrapper (90 seconds total)
        const timeoutPromise = new Promise<never>((_, reject) => {
            setTimeout(() => reject(new Error("Upload timeout - please try again with a smaller image")), 90000);
        });

        const result = await Promise.race([uploadPromise, timeoutPromise]);

        return {
            success: true,
            message: "Image uploaded successfully",
            url: result.secure_url,
            publicId: result.public_id
        };

    } catch (error) {
        console.error("Error uploading image:", error);
        return {
            success: false,
            message: "Failed to upload image. Please try again.",
            url: null
        };
    }
}

export async function deleteImageFromCloudinary(publicId: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, message: "Authentication required" };
        }

        await cloudinary.uploader.destroy(publicId);
        return { success: true, message: "Image deleted successfully" };
    } catch (error) {
        console.error("Error deleting image:", error);
        return { success: false, message: "Failed to delete image" };
    }
}