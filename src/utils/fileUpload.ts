import { Request } from 'express';
import multer from 'multer';
import { v2 as cloudinary, UploadApiResponse } from 'cloudinary';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.CLOUD_API_KEY as string,
    api_secret: process.env.CLOUD_API_SECRET as string,
});

// Vercel-এর জন্য memoryStorage ব্যবহার করতে হবে
const storage = multer.memoryStorage();

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// এই ফাংশনটি এখন সরাসরি Buffer গ্রহণ করবে
export const uploadToCloudinary = async (file: Express.Multer.File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
            {
                folder: 'medicines',
            },
            (error, result) => {
                if (error) return reject(new Error(`Cloudinary upload failed: ${error.message}`));
                resolve((result as UploadApiResponse).secure_url);
            }
        );

        // ফাইলের buffer-কে stream-এ কনভার্ট করে আপলোড করা হচ্ছে
        uploadStream.end(file.buffer);
    });
};