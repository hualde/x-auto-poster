import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

let auth: JWT | null = null;

if (typeof window === 'undefined') {
  console.log('Initializing Google API authentication...');
  const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;

  if (!credentials || !process.env.SPREADSHEET_ID) {
    console.error('Google API credentials or Spreadsheet ID are not properly set');
    console.log('GOOGLE_APPLICATION_CREDENTIALS:', credentials ? 'Set' : 'Not set');
    console.log('SPREADSHEET_ID:', process.env.SPREADSHEET_ID ? 'Set' : 'Not set');
  } else {
    try {
      const parsedCredentials = JSON.parse(credentials);
      auth = new JWT({
        email: parsedCredentials.client_email,
        key: parsedCredentials.private_key,
        scopes: ['https://www.googleapis.com/auth/spreadsheets'],
      });
      console.log('Google API authentication initialized successfully');
    } catch (error) {
      console.error('Error initializing Google API authentication:', error);
    }
  }
}

const sheets = google.sheets({ version: 'v4', auth: auth as JWT | undefined });

const SPREADSHEET_ID = process.env.SPREADSHEET_ID;
const RANGE = 'X!A2:C';

interface Tweet {
  nombreFoto: string;
  textoTweet: string;
  estado: string;
}

export async function getNextPendingTweet(): Promise<Tweet | null> {
  if (typeof window !== 'undefined') {
    const response = await fetch('/api/getNextPendingTweet');
    if (!response.ok) {
      throw new Error('Failed to fetch tweet data');
    }
    return response.json();
  }

  if (!auth) {
    console.error('Google API authentication is not set up correctly');
    throw new Error('Google API authentication is not set up correctly');
  }

  try {
    console.log('Attempting to fetch data from Google Sheets...');
    console.log('SPREADSHEET_ID:', SPREADSHEET_ID);
    console.log('RANGE:', RANGE);

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    console.log('Response received:', JSON.stringify(response.data, null, 2));

    const rows = response.data.values;
    if (rows && rows.length) {
      for (const row of rows) {
        if (row[2] === 'pendiente') {
          return {
            nombreFoto: row[0],
            textoTweet: row[1] || '#NAME?',
            estado: row[2]
          };
        }
      }
    }
    console.log('No pending tweets found');
    return null;
  } catch (error) {
    console.error('Error fetching tweets from Google Sheets:', error);
    throw error;
  }
}

export async function updateTweetStatus(nombreFoto: string, newStatus: string): Promise<void> {
  if (!auth) {
    console.error('Google API authentication is not set up correctly');
    throw new Error('Google API authentication is not set up correctly');
  }

  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: SPREADSHEET_ID,
      range: RANGE,
    });

    const rows = response.data.values;
    if (rows && rows.length) {
      for (let i = 0; i < rows.length; i++) {
        if (rows[i][0] === nombreFoto) {
          await sheets.spreadsheets.values.update({
            spreadsheetId: SPREADSHEET_ID,
            range: `X!C${i + 2}`,
            valueInputOption: 'RAW',
            requestBody: {
              values: [[newStatus]]
            }
          });
          console.log(`Updated status for ${nombreFoto} to ${newStatus}`);
          return;
        }
      }
    }
    console.error(`Tweet with nombreFoto ${nombreFoto} not found`);
  } catch (error) {
    console.error('Error updating tweet status:', error);
    throw error;
  }
}