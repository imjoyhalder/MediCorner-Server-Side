import { Request } from 'express';
import multer, { StorageEngine } from 'multer';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import fs from 'fs';

// Cloudinary Config (টাইপ কাস্টিং এর প্রয়োজন নেই, তবে এনভায়রনমেন্ট ভেরিয়েবল চেক করা ভালো)
cloudinary.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.CLOUD_API_KEY as string,
    api_secret: process.env.CLOUD_API_SECRET as string,
});

// ১. Multer storage টাইপ ডিফাইন করা
const storage: StorageEngine = multer.diskStorage({
    destination: function (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ) {
        // নিশ্চিত করুন আপনার রুট ডিরেক্টরিতে 'uploads' ফোল্ডারটি আছে
        cb(null, 'uploads/');
    },
    filename: function (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, filename: string) => void
    ) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});

// ২. Multer আপলোড মিডলওয়্যার (টাইপসহ)
export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } // ঐচ্ছিক: ৫ মেগাবাইট লিমিট
});

// ৩. Cloudinary Upload Utility - এখানে UploadApiResponse টাইপটি গুরুত্বপূর্ণ
export const uploadToCloudinary = async (filePath: string): Promise<string> => {
    try {
        const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
            folder: 'medicines',
        });

        // ফাইল আপলোড হয়ে গেলে লোকাল সার্ভার থেকে ডিলিট করে দেওয়া
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return result.secure_url;
    } catch (error) {
        // এরর আসলেও লোকাল ফাইল ডিলিট করা নিশ্চিত করুন
        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        const uploadError = error as UploadApiErrorResponse;
        throw new Error(`Cloudinary upload failed: ${uploadError.message}`);
    }
};