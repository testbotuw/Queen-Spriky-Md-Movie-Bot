const { promises } = require('fs');
const { join } = require('path');
const { spawn } = require('child_process');

/**
 * FFmpeg function to process media files.
 * @param {Buffer} buffer - The media buffer.
 * @param {Array} args - Additional arguments for FFmpeg.
 * @param {String} ext - Input file extension.
 * @param {String} ext2 - Output file extension.
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function ffmpeg(buffer, args = [], ext = '', ext2 = '') {
  return new Promise(async (resolve, reject) => {
    try {
      // Get the directory name of the current file
      const tmpDir = join(__dirname, '../tmp');
      const tmp = join(tmpDir, +new Date() + '.' + ext);
      const out = tmp + '.' + ext2;
      
      // Write the buffer to a temporary file
      await promises.writeFile(tmp, buffer);
      
      // Spawn the FFmpeg process
      const ffmpegProcess = spawn('ffmpeg', ['-y', '-i', tmp, ...args, out]);
      
      ffmpegProcess.on('error', reject);
      ffmpegProcess.on('close', async (code) => {
        try {
          // Clean up the temporary input file
          await promises.unlink(tmp);
          if (code !== 0) return reject(code);
          
          // Resolve with the output data
          resolve({
            data: await promises.readFile(out),
            filename: out,
            delete() {
              return promises.unlink(out);
            },
          });
        } catch (e) {
          reject(e);
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Convert Audio to Playable WhatsApp Audio (PTT)
 * @param {Buffer} buffer - Audio Buffer
 * @param {String} ext - File Extension
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toPTT(buffer, ext) {
  return ffmpeg(buffer, ['-vn', '-c:a', 'libopus', '-b:a', '128k', '-vbr', 'on'], ext, 'ogg');
}

/**
 * Convert Audio to Playable WhatsApp PTT
 * @param {Buffer} buffer - Audio Buffer
 * @param {String} ext - File Extension
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toAudio(buffer, ext) {
  return ffmpeg(
    buffer,
    ['-vn', '-c:a', 'libopus', '-b:a', '128k', '-vbr', 'on', '-compression_level', '10'],
    ext,
    'opus'
  );
}

/**
 * Convert Audio to Playable WhatsApp Video
 * @param {Buffer} buffer - Video Buffer
 * @param {String} ext - File Extension
 * @returns {Promise<{data: Buffer, filename: String, delete: Function}>}
 */
function toVideo(buffer, ext) {
  return ffmpeg(
    buffer,
    [
      '-c:v',
      'libx264',
      '-c:a',
      'aac',
      '-ab',
      '128k',
      '-ar',
      '44100',
      '-crf',
      '32',
      '-preset',
      'slow',
    ],
    ext,
    'mp4'
  );
}

// Export the functions for use in other modules
module.exports = { toAudio, toPTT, toVideo, ffmpeg };

