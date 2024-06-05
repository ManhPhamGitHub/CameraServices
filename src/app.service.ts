// camera.service.ts
import { Injectable } from '@nestjs/common';
import { PassThrough } from 'stream';
import * as ffmpeg from 'fluent-ffmpeg';
import { v2 as Cloudinary } from 'cloudinary';
import { Storage } from '@google-cloud/storage';
import { join } from 'path';
import * as fs from 'fs';

@Injectable()
export class CameraService {
  private storage;
  private bucketName: string = 'ducmanhpham';
  constructor() {
    this.storage = new Storage({
      projectId: 'fir-a5cfe',
      keyFilename:
        '/root/manhpham/CameraServices/src/secret/fir-a5cfe-b582bda476a7.json',
    });
  }

  async startStreaming(cameraUrl: string): Promise<void> {
    const stream = new PassThrough();
    const currentDate = new Date();

    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0'); // Adding 1 because months are zero-based
    const day = String(currentDate.getDate()).padStart(2, '0');
    const hours = String(currentDate.getHours()).padStart(2, '0');
    const previousHours = String(currentDate.getHours() - 2).padStart(2, '0');
    const folderPath = join(__dirname, `../storage/${year}-${month}-${day}`);

    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }

    const formattedDate = `${year}-${month}-${day}_${hours}`;
    const fileName = `output_${formattedDate}.mp4`;
    const fileNamePreviousHours = `output_${year}-${month}-${day}_${previousHours}.mp4`;
    const playlistName = `output_${formattedDate}.m3u8`;
    const playlistNamePreviousHours = `output_${year}-${month}-${day}_${previousHours}.m3u8`;

    const segmentFileName = `segment_${formattedDate}_%03d.ts`;
    const playlistPath = join(folderPath, playlistName);
    const playlistPathPreviousHours = join(
      folderPath,
      playlistNamePreviousHours,
    );

    const segmentPath = join(folderPath, segmentFileName);
    // Upload the recorded MP4 file to Cloudinary with the generated filename
    const outputFilePath = join(folderPath, fileName);
    const outputFilePathPreviousHour = join(folderPath, fileNamePreviousHours);

    // Create an ffmpeg process to read from the camera URL
    const ffmpegCommand = ffmpeg(cameraUrl)
      .inputOptions(['-rtsp_transport tcp'])
      // .outputOptions([
      //   '-c:v libx264',
      //   '-vf scale=1280:720',
      //   '-f segment',
      //   '-segment_time 3600',
      //   '-reset_timestamps 1',
      //   '-strftime 1',
      // ])
      .outputOptions([
        '-c:v libx264',
        '-vf scale=1280:720',
        '-f hls',
        '-hls_time 2',
        '-hls_list_size 5',
        '-hls_flags delete_segments',
        `-hls_segment_filename ${segmentPath}`,
      ])
      .output(playlistPath)

      // .output(outputFilePath)
      .on('error', (err) => {
        console.error('FFmpeg error:', err);
        stream.end();
        // reject(err); // Reject the promise on error
      })
      .on('start', async (commandLine) => {
        console.log('Spawned FFmpeg with command:', commandLine);

        await this.uploadToGoogleCloud(
          playlistPathPreviousHours,
          playlistNamePreviousHours,
          `${year}-${month}-${day}`,
        );
        // Handle Cloudinary upload result as needed
      })
      .on('end', async () => {
        console.log('FFmpeg process finished');
        // resolve(); // Resolve the promise on completion
      });

    await ffmpegCommand.run(stream);
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

  private async uploadToGoogleCloud(
    filePath: string,
    fileName: string,
    folderName: string,
  ) {
    try {
      console.log('uploadToGoogleCloud progress => ', filePath);
      await fs.promises.access(filePath, fs.constants.F_OK);

      const bucket = this.storage.bucket(this.bucketName);

      const destination = `${folderName}/${fileName}`;
      await bucket.upload(filePath, {
        destination,
        metadata: {
          contentType: 'video/mp4',
        },
      });
      console.log(`File uploaded to ${destination}`);

      await fs.unlinkSync(filePath);
    } catch (err) {
      if (err.code === 'ENOENT') {
        console.error('File does not exist, skipping upload.');
      } else {
        console.error('Error:', err);
      }
    }
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
