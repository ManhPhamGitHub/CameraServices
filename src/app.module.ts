import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { CameraService } from './app.service';
import { TasksModule } from './tasks/tasks.module';

@Module({
  controllers: [AppController],
  providers: [CameraService],
  imports: [TasksModule],
})
export class AppModule {}
