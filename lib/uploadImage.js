const fetch = require('node-fetch');
const { FormData, Blob } = require('formdata-node');
const { fileTypeFromBuffer } = require('file-type');

/**
 * Upload image to telegra.ph
 * Supported mimetype:
 * - `image/jpeg`
 * - `image/jpg`
 * - `image/png`
 * @param {Buffer} buffer Image Buffer
 * @return {Promise<string>}
 */
module.exports = async (buffer) => {
  const { ext, mime } = await fileTypeFromBuffer(buffer);
  const form = new FormData();
  const blob = new Blob([buffer], { type: mime });
  form.append('file', blob, 'tmp.' + ext);
  const res = await fetch('https://telegra.ph/upload', {
    method: 'POST',
    body: form,
  });
  const img = await res.json();
  if (img.error) throw new Error(img.error);
  return 'https://telegra.ph' + img[0].src;
};
