const fetch = require('node-fetch');
const { FormData, Blob } = require('formdata-node');
const { fileTypeFromBuffer } = require('file-type');

/**
 * Upload ephemeral file to file.io
 * `Expired in 1 day`
 * `100MB Max Filesize`
 * @param {Buffer} buffer File Buffer
 */
const fileIO = async (buffer) => {
  const { ext, mime } = (await fileTypeFromBuffer(buffer)) || {};
  let form = new FormData();
  
  // Create a blob directly from the buffer
  const blob = new Blob([buffer], { type: mime });
  form.append('file', blob, 'tmp.' + ext);
  
  const res = await fetch('https://file.io/?expires=1d', {
    method: 'POST',
    body: form,
  });
  
  const json = await res.json();
  if (!json.success) throw new Error(`File.io upload failed: ${JSON.stringify(json)}`);
  
  return json.link;
};

/**
 * Upload file to storage.restfulapi.my.id
 * @param {Buffer|ReadableStream|(Buffer|ReadableStream)[]} inp File Buffer/Stream or Array of them
 * @returns {string|null|(string|null)[]}
 */
const RESTfulAPI = async (inp) => {
  const form = new FormData();
  const buffers = Array.isArray(inp) ? inp : [inp];

  for (let buffer of buffers) {
    // Create a blob directly from the buffer
    const blob = new Blob([buffer]);
    form.append('file', blob);
  }
  
  const res = await fetch('https://storage.restfulapi.my.id/upload', {
    method: 'POST',
    body: form,
  });
  
  const json = await res.text();
  try {
    const parsedJson = JSON.parse(json);
    if (!Array.isArray(inp)) return parsedJson.files[0]?.url || null; // Return first file URL
    return parsedJson.files.map((file) => file.url); // Map through to get all file URLs
  } catch (e) {
    throw new Error(`RESTfulAPI upload failed: ${json}`);
  }
};

/**
 * Upload file using multiple APIs and return the first successful response
 * @param {Buffer} inp
 * @returns {Promise<string>}
 */
module.exports = async function uploadFile(inp) {
  let lastError = null;
  
  for (let upload of [RESTfulAPI, fileIO]) {
    try {
      return await upload(inp);
    } catch (e) {
      lastError = e; // Store the last error encountered
    }
  }
  
  throw lastError; // If all uploads fail, throw the last error
};
