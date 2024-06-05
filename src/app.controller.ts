import { Controller, Get } from '@nestjs/common';
import { CameraService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: CameraService) {}

  @Get()
  async getHello() {
    const cameraUrl = 'rtsp://rtspstream:585ec393e50c3cc0b554420a881842cb@zephyr.rtsp.stream/pattern';
    await this.appService.startStreaming(cameraUrl);
  }
}
