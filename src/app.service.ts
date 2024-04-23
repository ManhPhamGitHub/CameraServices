// camera.service.ts
import { Injectable } from '@nestjs/common';
import { PassThrough } from 'stream';
import * as ffmpeg from 'fluent-ffmpeg';
import { v2 as Cloudinary } from 'cloudinary';

@Injectable()
export class CameraService {
  constructor() {
    Cloudinary.config({
      cloud_name: 'dlnvlyn5k',
      api_key: '362136862817161',
      api_secret: 'FaWl6ohpbr0ZWQOMP7uid38kFi0',
    });
  }

  async startStreaming(cameraUrl: string): Promise<any> {
    const stream = new PassThrough();

    // Create an ffmpeg process to read from camera URL
    const ffmpegProcess = ffmpeg()
      .input(cameraUrl)
      .outputOptions([
        '-c:v copy',
        '-f segment',
        '-segment_time 3600',
        '-segment_list pipe:1',
        '-segment_list_type csv',
        '-segment_format mp4',
      ])
      .output('pipe:1')
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        stream.end();
      });

    // Start the ffmpeg process
    ffmpegProcess.run();

    // Upload hourly segments to Cloudinary
    ffmpegProcess.on('data', async (data: Buffer) => {
      console.log('222222222222222222222222', data);

      const timestamp = Date.now();
      const folderName = new Date(timestamp)
        .toLocaleDateString('en-US', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        })
        .replace(/\//g, '-'); // Format: day-month-year

      try {
        // Upload segment to Cloudinary

        const result = await Cloudinary.uploader
          .upload_stream(
            { resource_type: 'video', folder: folderName },
            (error, result) => {
              if (error) {
                console.error('Error uploading segment to Cloudinary:', error);
              } else {
                console.log(
                  `Segment uploaded to Cloudinary successfully: ${result.secure_url}`,
                );
              }
            },
          )
          .end(data);
      } catch (error) {
        console.error('Error uploading segment to Cloudinary:', error);
      }
    });

    return ffmpegProcess;
  }
}
