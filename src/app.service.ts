// camera.service.ts
import { Injectable } from '@nestjs/common';
import { PassThrough } from 'stream';
import * as ffmpeg from 'fluent-ffmpeg';
import { v2 as Cloudinary } from 'cloudinary';
import { Storage } from '@google-cloud/storage';
import path from 'path';
@Injectable()
export class CameraService {
  private storage;
  constructor() {
    this.storage = new Storage({
      projectId: 'fir-a5cfe',
      keyFilename: path.resolve(
        __dirname,
        'secret/fir-a5cfe-b582bda476a7.json',
      ),
    });
  }

  async startStreaming(cameraUrl: string): Promise<void> {
    const stream = new PassThrough();
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');

    const formattedDate = `${year}-${month}-${day}_${hours}`;
    const fileName = `output_${formattedDate}.mp4`;

    // Upload the recorded MP4 file to Cloudinary with the generated filename
    const filePath = `/root/manhpham/CameraServices/storage/${fileName}`;
    // Create an ffmpeg process to read from the camera URL
    const ffmpegCommand = ffmpeg(cameraUrl)
      .inputOptions(['-rtsp_transport tcp'])
      .outputOptions([
        '-c:v libx264',
        '-vf scale=1280:720',
        '-f segment',
        '-segment_time 120',
        '-segment_list pipe:1',
        '-segment_list_type csv',
        '-segment_format mp4',
        '-map 0',
        '-reset_timestamps 1',
        '-strftime 1',
      ])
      .output('/root/manhpham/CameraServices/storage/output_%Y-%m-%d_%H.mp4')
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        stream.end();
        // reject(err); // Reject the promise on error
      })
      .on('start', (commandLine) => {
        console.log('Spawned FFmpeg with command:', commandLine);
      })
      .on('end', async () => {
        console.log('FFmpeg process finished');
        // resolve(); // Resolve the promise on completion
        try {
          // Upload the recorded MP4 file to Cloudinary
          await this.uploadToCloudinary(filePath);
          // Handle Cloudinary upload result as needed
        } catch (err) {
          console.error('Error uploading to Cloudinary:', err);
        }
      });

    await ffmpegCommand.run(stream);

    // try {
    //   Cloudinary.uploader
    //     .upload_stream(
    //       { resource_type: 'video', folder: folderName },
    //       (error, result) => {
    //         if (error) {
    //           console.error('Error uploading segment to Cloudinary:', error);
    //         } else {
    //           console.log(
    //             `Segment uploaded to Cloudinary successfully: ${result.secure_url}`,
    //           );
    //         }
    //       },
    //     )
    //     .end(data);
    // } catch (error) {
    //   console.error('Error uploading segment to Cloudinary:', error);
    // }
    // });

    // Handle cleanup or additional logic as needed
  }

  uploadToCloudinary = (filePath) => {
    return new Promise((resolve, reject) => {
      Cloudinary.uploader.upload(
        filePath,
        { resource_type: 'video' },
        (error, result) => {
          if (error) {
            console.error('Error uploading to Cloudinary:', error);
            reject(error);
          } else {
            console.log('Upload to Cloudinary successful:', result);
            resolve(result);
          }
        },
      );
    });
  };

  async uploadToGoogleCloudStorage(filePath: string, fileName: string) {
    const bucketName = 'ducmanhpham';
    await this.storage.bucket(bucketName).upload(filePath, {
      destination: fileName,
    });
    console.log(`File ${fileName} uploaded to ${bucketName}`);
  }
}

// const ffmpegProcess = ffmpeg(cameraUrl)
//       .inputOptions(['-rtsp_transport tcp'])
//       .outputOptions([
//         '-c:v libx264',
//         '-vf scale=1280:720',
//         '-f segment',
//         '-segment_time 3600',
//         '-segment_list pipe:1',
//         '-segment_list_type csv',
//         '-segment_format mp4',
//       ])
//       .output('pipe:1')
//       .on('error', (err) => {
//         console.error('FFmpeg error:', err);
//         stream.end();
//       });

//     ffmpegProcess.on('start', (commandLine) => {
//       console.log('Spawned FFmpeg with command:', commandLine);
//     });

//     // Start the ffmpeg process
//     ffmpegProcess.run();

//     // Upload hourly segments to Cloudinary
//     ffmpegProcess.on('data', (data: Buffer) => {
//       console.log('data received ', data);

// Spawned FFmpeg with command: ffmpeg -rtsp_transport tcp -i rtsp://rtsp-test-server.viomic.com:554/stream -y -c:v libx264 -vf scale=1280:720 -f segment -segment_time 120 -segment_list pipe:1 -segment_list_type csv -segment_format mp4 -map 0 -reset_timestamps 1 -strftime 1 /root/manhpham/CameraServices/storage/output_%Y-%m-%d_%H.mp4
// FFmpeg process finished
// Error uploading to Cloudinary: [Error: ENOENT: no such file or directory, open '/root/manhpham/CameraServices/storage/output_2024_05_12_09_57_52.mp4'] {
//   errno: -2,
//   code: 'ENOENT',
//   syscall: 'open',
//   path: '/root/manhpham/CameraServices/storage/output_2024_05_12_09_57_52.mp4'
// }
// Error uploading to Cloudinary: [Error: ENOENT: no such file or directory, open '/root/manhpham/CameraServices/storage/output_2024_05_12_09_57_52.mp4'] {
//   errno: -2,
//   code: 'ENOENT',
//   syscall: 'open',
//   path: '/root/manhpham/CameraServices/storage/output_2024_05_12_09_57_52.mp4'
// }
