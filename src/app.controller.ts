import { Controller, Get } from '@nestjs/common';
import { CameraService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: CameraService) {}

  @Get()
  async getHello() {
    const cameraUrl = '/home/manhpd/manh.pd/test/CameraServices/project-name/src/assest/chillies.mp4';
    await this.appService.startStreaming(cameraUrl);
  }
}
