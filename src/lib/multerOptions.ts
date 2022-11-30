import { existsSync, mkdirSync } from "fs";
import { diskStorage } from "multer";
import filenameUtils from "src/utils/filename.utils";

export const multerOptions = {
  storage: diskStorage({
    destination: (req, file, cb) => {
      const uploadPath: string = 'upload';
      if (!existsSync(uploadPath)) {
        mkdirSync(uploadPath);
      }
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      cb(null, filenameUtils(file.originalname));
    }
  })
};