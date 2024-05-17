import { Module } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { CameraService } from 'src/app.service';

@Module({
  providers: [TasksService, CameraService],
  controllers: [TasksController],
})
export class TasksModule {}
