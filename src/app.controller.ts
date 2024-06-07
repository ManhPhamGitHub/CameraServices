import { Controller, Get } from '@nestjs/common';
import { CameraService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: CameraService) {}

  @Get()
  async getHello() {
    const cameraUrl = 'rtsp://localhost:8554/live.stream';
    await this.appService.startStreaming(cameraUrl);
  }
}
