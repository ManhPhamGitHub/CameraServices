import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { AppController } from './app.controller';
import { CameraService } from './app.service';
import { TasksModule } from './tasks/tasks.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  controllers: [AppController],
  providers: [CameraService],
  imports: [
    ScheduleModule.forRoot(),
    TasksModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'storage'),
    }),
  ],
})
export class AppModule {}
