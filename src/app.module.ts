import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { CameraService } from './app.service';
import { TasksModule } from './tasks/tasks.module';

@Module({
  controllers: [AppController],
  providers: [CameraService],
  imports: [ScheduleModule.forRoot(), TasksModule, CameraService],
})
export class AppModule {}
