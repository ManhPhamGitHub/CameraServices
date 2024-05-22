import { Controller, Get } from '@nestjs/common';
import { CameraService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: CameraService) {}

  @Get()
  async getHello() {
    const mockData = [
      {
        cameraUrl: 'rtsp://rtsp-test-server.viomic.com:554/stream',
        name: 'Camera_1',
      },
      {
        cameraUrl: 'rtsp://rtsp-test-server.viomic.com:554/stream',
        name: 'Camera_2',
      },
    ];
    mockData.forEach((camera) => {
      this.appService.startStreaming(camera.cameraUrl, camera.name);
    });
  }
}
