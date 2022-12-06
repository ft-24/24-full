import { HttpException, HttpStatus } from "@nestjs/common";
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
    },
  }),
  limits: {
    fileSize: 1024 * 1024,
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.match(/\/(jpg|jpeg|png)$/)) {
      cb(null, true);
    } else {
      console.log('something')
      cb(
        new HttpException(
          {
            message: 1,
            error: '지원하지 않는 이미지 형식입니다.'
          },
          HttpStatus.BAD_REQUEST,
        ),
        false
      )
    }
  }
};