const { google } = require('googleapis');
const stream = require('stream');

/// Configuración de autenticación
const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const drive = google.drive({ version: 'v3', auth });

async function downloadImage(fileId) {
  try {
    const res = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    return Buffer.from(res.data);
  } catch (error) {
    console.error('Error al descargar la imagen de Google Drive:', error);
    throw error;
  }
}

module.exports = {
  downloadImage
};