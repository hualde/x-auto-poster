const { google } = require('googleapis');

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = 'X!A2:C'; // Ajustado para las tres columnas

async function getNextPendingTweet() {
  try {
    console.log('Intentando obtener datos de la hoja de cálculo...');
    console.log('SPREADSHEET_ID:', SPREADSHEET_ID);
    console.log('RANGE:', RANGE);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    console.log('Respuesta recibida:', JSON.stringify(response.data, null, 2));

    const rows = response.data.values;
    if (rows && rows.length) {
      for (const row of rows) {
        if (row[2] === 'pendiente') { // Asumiendo que 'pendiente' es el estado para tweets no publicados
          return {
            nombreFoto: row[0],
            textoTweet: row[1],
            estado: row[2]
          };
        }
      }
    }
    console.log('No se encontraron tweets pendientes');
    return null; // No se encontraron tweets pendientes
  } catch (error) {
    console.error('Error al obtener tweets de Google Sheets:', error);
    throw error;
  }
}

async function updateTweetStatus(nombreFoto, nuevoEstado) {
  try {
    console.log(`Actualizando estado del tweet ${nombreFoto} a ${nuevoEstado}`);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    let rowIndex = -1;
    for (let i = 0; i < rows.length; i++) {
      if (rows[i][0] === nombreFoto) {
        rowIndex = i + 2; // +2 porque empezamos en A2
        break;
      }
    }

    if (rowIndex === -1) {
      throw new Error('Tweet no encontrado');
    }

    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `X!C${rowIndex}`,
      valueInputOption: 'RAW',
      resource: {
        values: [[nuevoEstado]]
      }
    });

    console.log(`Estado del tweet ${nombreFoto} actualizado a ${nuevoEstado}`);
  } catch (error) {
    console.error('Error al actualizar el estado del tweet:', error);
    throw error;
  }
}

module.exports = {
  getNextPendingTweet,
  updateTweetStatus
};