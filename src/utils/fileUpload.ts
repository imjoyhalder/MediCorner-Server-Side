import { Request } from 'express';
import multer, { StorageEngine } from 'multer';
import { v2 as cloudinary, UploadApiResponse, UploadApiErrorResponse } from 'cloudinary';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME as string,
    api_key: process.env.CLOUD_API_KEY as string,
    api_secret: process.env.CLOUD_API_SECRET as string,
});

const storage: StorageEngine = multer.diskStorage({
    destination: function (
        req: Request,
        file: Express.Multer.File,
        cb: (error: Error | null, destination: string) => void
    ) {
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

export const upload = multer({
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 } 
});

export const uploadToCloudinary = async (filePath: string): Promise<string> => {
    try {
        const result: UploadApiResponse = await cloudinary.uploader.upload(filePath, {
            folder: 'medicines',
        });

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        return result.secure_url;
    } catch (error) {

        if (fs.existsSync(filePath)) {
            fs.unlinkSync(filePath);
        }

        const uploadError = error as UploadApiErrorResponse;
        throw new Error(`Cloudinary upload failed: ${uploadError.message}`);
    }
};