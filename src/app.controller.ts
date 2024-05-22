import { Controller, Get } from '@nestjs/common';
import { CameraService } from './app.service';
import { mockData } from './constant';

@Controller()
export class AppController {
  constructor(private readonly appService: CameraService) {}

  @Get()
  async getHello() {
    mockData.forEach((camera) => {
      this.appService.startStreaming(camera.cameraUrl, camera.name);
    });
  }
}
