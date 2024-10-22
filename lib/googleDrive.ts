import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

let auth: JWT | null = null;

if (typeof window === 'undefined') {
  console.log('Initializing Google Drive API authentication...');
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credentials || !process.env.GOOGLE_DRIVE_FOLDER_ID) {
    console.error('Google API credentials or Drive Folder ID are not properly set');
    console.log('GOOGLE_APPLICATION_CREDENTIALS:', credentials ? 'Set' : 'Not set');
    console.log('GOOGLE_DRIVE_FOLDER_ID:', process.env.GOOGLE_DRIVE_FOLDER_ID ? 'Set' : 'Not set');
  } else {
    try {
      const parsedCredentials = JSON.parse(credentials);
      auth = new JWT({
        email: parsedCredentials.client_email,
        key: parsedCredentials.private_key,
        scopes: ['https://www.googleapis.com/auth/drive.readonly'],
      });
      console.log('Google Drive API authentication initialized successfully');
    } catch (error) {
      console.error('Error initializing Google Drive API authentication:', error);
    }
  }
}

const drive = google.drive({ version: 'v3', auth: auth as JWT | undefined });

export async function downloadImage(fileName: string): Promise<Buffer> {
  if (!auth) {
    console.error('Google Drive API authentication is not set up correctly');
    throw new Error('Google Drive API authentication is not set up correctly');
  }

  try {
    console.log(`Searching for file: ${fileName}`);
    const response = await drive.files.list({
      q: `name='${fileName}' and '${process.env.GOOGLE_DRIVE_FOLDER_ID}' in parents`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    const files = response.data.files;
    if (files && files.length > 0) {
      const fileId = files[0].id;
      console.log(`File found. ID: ${fileId}`);

      const res = await drive.files.get(
        { fileId: fileId!, alt: 'media' },
        { responseType: 'arraybuffer' }
      );

      return Buffer.from(res.data as ArrayBuffer);
    } else {
      throw new Error(`File ${fileName} not found in the specified folder`);
    }
  } catch (error) {
    console.error('Error downloading image from Google Drive:', error);
    throw error;
  }
}