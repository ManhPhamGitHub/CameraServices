import { Injectable, OnModuleInit } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { CameraService } from 'src/app.service';
@Injectable()
export class TasksService implements OnModuleInit {
  constructor(private readonly cameraService: CameraService) {}

  onModuleInit() {
    this.startRecording();
  }

  async startRecording() {
    const cameraUrl = 'rtsp://rtsp-test-server.viomic.com:554/stream'; // Replace with your RTSP URL
    while (true) {
      await this.cameraService.startStreaming(cameraUrl);
    }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    const cameraUrl = 'rtsp://rtsp-test-server.viomic.com:554/stream'; // Replace with your RTSP URL
    await this.cameraService.startStreaming(cameraUrl);
  }
}
