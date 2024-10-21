const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

async function authorize() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    scopes: SCOPES,
  });
  return auth;
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

  const response = await drive.files.get(
    {fileId: fileId, alt: 'media'},
    {responseType: 'arraybuffer'}
  );

  return {
    buffer: Buffer.from(response.data),
    mimeType: response.headers['content-type']
  };
}

export async function downloadImage(fileName) {
  try {
    const auth = await authorize();
    return await getImageFromDrive(auth, fileName);
  } catch (error) {
    console.error('Error accessing Google Drive:', error);
    throw error;
  }
}