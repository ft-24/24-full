import { Controller, Get, Logger, Post, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { existsSync, mkdirSync } from 'fs';
import { diskStorage } from 'multer';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file',
  {
    storage: diskStorage({
      destination: (req, file, cb) => {
        const uploadPath: string = 'upload';
        if (!existsSync(uploadPath)) {
          mkdirSync(uploadPath);
        }
        cb(null, uploadPath);
      },
      filename: (req, file, cb) => {
        cb(null, file.originalname);
      }
    })
  }))
  uploadFile() {
    const logger = new Logger(AppController.name);
    logger.log('File Uploaded!');
  }

}
