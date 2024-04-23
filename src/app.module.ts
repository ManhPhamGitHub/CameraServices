import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CameraService } from './app.service';

@Module({
  controllers: [AppController],
  providers: [CameraService],
})
export class AppModule {}
