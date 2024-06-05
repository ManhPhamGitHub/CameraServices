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
    // const cameraUrl = 'rtsp://rtsp-test-server.viomic.com:554/stream'; // Replace with your RTSP URL
    // while (true) {
    //   await this.cameraService.startStreaming(cameraUrl);
    // }
  }

  @Cron(CronExpression.EVERY_HOUR)
  async handleCron() {
    // const cameraUrl = 'rtsp://rtsp-test-server.viomic.com:554/stream'; // Replace with your RTSP URL
    const cameraUrl = 'rtsp://rtspstream:585ec393e50c3cc0b554420a881842cb@zephyr.rtsp.stream/pattern'
    await this.cameraService.startStreaming(cameraUrl);
  }
}
