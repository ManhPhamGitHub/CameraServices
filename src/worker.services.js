"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var child_process_1 = require("child_process");
var fileMp4 = '/home/manhpd/manh.pd/test/CameraServices/project-name/src/assest/chillies.mp4'; // Path to your input MP4 file
// Create FFmpeg command with appropriate options
var ffmpegArgs = [
    '-i',
    fileMp4,
    '-c:v',
    'copy',
    '-f',
    'segment',
    '-segment_time',
    '3600',
    '-segment_list',
    '/home/manhpd/manh.pd/test/CameraServices/project-name/src/assest/segment_list.txt', // Output segment list file
    '-segment_format',
    'mp4',
    '/home/manhpd/manh.pd/test/CameraServices/project-name/src/assest/%03d.mp4', // Output file pattern
];
// Spawn FFmpeg process
var ffmpegProcess = (0, child_process_1.spawn)('ffmpeg', ffmpegArgs);
// Handle FFmpeg process events
ffmpegProcess.stderr.on('data', function (data) {
    console.error('FFmpeg error:', data.toString());
});
ffmpegProcess.on('close', function (code) {
    console.log("FFmpeg process exited with code ".concat(code));
    // After FFmpeg completes segmentation, you can upload the segments to Cloudinary
    uploadSegmentsToCloudinary();
});
ffmpegProcess.on('error', function (err) {
    console.error('Error starting FFmpeg process:', err);
});
// Function to upload segmented files to Cloudinary
function uploadSegmentsToCloudinary() {
    // Implement your Cloudinary upload logic here
    // Use Cloudinary SDK or API to upload segmented files to Cloudinary
    // Example: cloudinary.uploader.upload(segmentFilePath, options, callback);
}
