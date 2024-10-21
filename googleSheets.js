const { google } = require('googleapis');

const SCOPES = ['https://www.googleapis.com/auth/spreadsheets.readonly'];

async function authorize() {
  const auth = new google.auth.GoogleAuth({
    credentials: JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS),
    scopes: SCOPES,
  });
  return auth;
}

async function getSheetData(auth) {
  const sheets = google.sheets({version: 'v4', auth});
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEET_ID,
    range: 'Sheet1!A2:D', // Ajusta esto según tu hoja de cálculo
  });
  const rows = res.data.values;
  if (!rows || rows.length === 0) {
    console.log('No data found.');
    return [];
  }
  return rows.map((row) => ({
    photoName: row[0],
    tweetText: row[1],
    link: row[2],
    status: row[3] || 'Pendiente'
  }));
}

async function getNextPendingTweet() {
  try {
    const auth = await authorize();
    const data = await getSheetData(auth);
    return data.find(row => row.status === 'Pendiente');
  } catch (error) {
    console.error('Error accessing Google Sheets:', error);
    throw error;
  }
}

module.exports = { getNextPendingTweet };