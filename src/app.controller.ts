import { Controller, Get } from '@nestjs/common';
import { CameraService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: CameraService) {}

  @Get()
  async getHello() {
    const cameraUrl = 'rtsp://rtsp-test-server.viomic.com:554/stream';
    await this.appService.startStreaming(cameraUrl);
  }
}
