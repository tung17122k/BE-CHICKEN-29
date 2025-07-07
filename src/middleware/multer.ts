import { METHODS } from "http";
import multer from "multer"
import path from "path";
import { v4 } from "uuid";

const fileUploadMiddleware = (fileName: string, dir: string = 'images') => {
    return multer({
        storage: multer.diskStorage({
            destination: 'public/' + dir,
            filename: (req, file, cb) => {
                const extension = path.extname(file.originalname);
                console.log("extension", extension);
                cb(null, v4() + extension);
            }
        }),
        limits: {
            fileSize: 1024 * 1024 * 10 // 10MB
        },
        fileFilter: (req: Express.Request, file: Express.Multer.File, cb: Function) => {
            if (
                file.mimetype === 'image/png' ||
                file.mimetype === 'image/jpg' ||
                file.mimetype === 'image/jpeg' ||
                file.mimetype === 'image/gif'
            ) {
                cb(null, true);
            } else {
                cb(new Error('Only JPEG and PNG images are allowed.'), false);
            }
        }
    }).single(fileName)
}

export default fileUploadMiddleware;