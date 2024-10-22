import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { JWT } from 'google-auth-library';

export async function GET() {
  try {
    const credentials = process.env.GOOGLE_APPLICATION_CREDENTIALS;
    
    if (!credentials || !process.env.SPREADSHEET_ID) {
      throw new Error('Missing required environment variables');
    }

    const parsedCredentials = JSON.parse(credentials);
    const auth = new JWT({
      email: parsedCredentials.client_email,
      key: parsedCredentials.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.SPREADSHEET_ID,
    });

    return NextResponse.json({ success: true, title: response.data.properties?.title });
  } catch (error) {
    console.error('Error testing Google API authentication:', error);
    return NextResponse.json({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}