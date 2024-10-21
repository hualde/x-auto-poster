const fs = require('fs').promises;
const path = require('path');
const process = require('process');
const {authenticate} = require('@google-cloud/local-auth');
const {google} = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];
const TOKEN_PATH = path.join(process.cwd(), 'token.json');
const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials.json');

async function loadSavedCredentialsIfExist() {
  try {
    const content = await fs.readFile(TOKEN_PATH);
    const credentials = JSON.parse(content);
    return google.auth.fromJSON(credentials);
  } catch (err) {
    return null;
  }
}

async function saveCredentials(client) {
  const content = await fs.readFile(CREDENTIALS_PATH);
  const keys = JSON.parse(content);
  const key = keys.installed || keys.web;
  const payload = JSON.stringify({
    type: 'authorized_user',
    client_id: key.client_id,
    client_secret: key.client_secret,
    refresh_token: client.credentials.refresh_token,
  });
  await fs.writeFile(TOKEN_PATH, payload);
}

async function authorize() {
  let client = await loadSavedCredentialsIfExist();
  if (client) {
    return client;
  }
  client = await authenticate({
    scopes: SCOPES,
    keyfilePath: CREDENTIALS_PATH,
  });
  if (client.credentials) {
    await saveCredentials(client);
  }
  return client;
}

async function getImageFromDrive(auth, fileName) {
  const drive = google.drive({version: 'v3', auth});
  const res = await drive.files.list({
    q: `name='${fileName}' and '${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`,
    fields: 'files(id, name)',
    spaces: 'drive',
  });
  
  const files = res.data.files;
  if (files.length === 0) {
    throw new Error('Image not found');
  }

  const fileId = files[0].id;
  const dest = path.join(process.cwd(), 'temp', fileName);
  const destStream = fs.createWriteStream(dest);

  const response = await drive.files.get(
    {fileId: fileId, alt: 'media'},
    {responseType: 'stream'}
  );

  return new Promise((resolve, reject) => {
    response.data
      .on('end', () => {
        console.log('File downloaded successfully');
        resolve(dest);
      })
      .on('error', err => {
        console.error('Error downloading file');
        reject(err);
      })
      .pipe(destStream);
  });
}

async function downloadImage(fileName) {
  try {
    const auth = await authorize();
    return await getImageFromDrive(auth, fileName);
  } catch (error) {
    console.error('Error accessing Google Drive:', error);
    throw error;
  }
}

module.exports = { downloadImage };