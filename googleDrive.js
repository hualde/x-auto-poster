const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/drive.readonly'],
});

const drive = google.drive({ version: 'v3', auth });

async function downloadImage(fileName) {
  try {
    console.log(`Buscando archivo: ${fileName}`);
    const response = await drive.files.list({
      q: `name='${fileName}' and mimeType contains 'image/'`,
      fields: 'files(id, name)',
      spaces: 'drive',
    });

    console.log(`Archivos encontrados: ${response.data.files.length}`);

    if (response.data.files.length === 0) {
      throw new Error(`No se encontró la imagen: ${fileName}`);
    }

    // Si hay múltiples archivos con el mismo nombre, usamos el primero
    const fileId = response.data.files[0].id;
    console.log(`ID del archivo encontrado: ${fileId}`);

    const imageResponse = await drive.files.get(
      { fileId: fileId, alt: 'media' },
      { responseType: 'arraybuffer' }
    );

    console.log(`Imagen descargada, tamaño: ${imageResponse.data.length} bytes`);

    return Buffer.from(imageResponse.data);
  } catch (error) {
    console.error('Error al descargar la imagen de Google Drive:', error);
    throw error;
  }
}

module.exports = { downloadImage };