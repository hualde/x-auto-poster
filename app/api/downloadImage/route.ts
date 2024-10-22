import { NextRequest, NextResponse } from 'next/server';
import { downloadImage } from '@/lib/googleDrive';
import { put } from '@vercel/blob';

export async function GET(request: NextRequest) {
  const fileName = request.nextUrl.searchParams.get('fileName');

  if (!fileName) {
    return NextResponse.json({ error: 'File name is required' }, { status: 400 });
  }

  try {
    console.log(`Buscando archivo: ${fileName}`);
    const imageBuffer = await downloadImage(fileName);

    const blob = await put(fileName, imageBuffer, { access: 'public' });

    return NextResponse.json({ url: blob.url });
  } catch (error) {
    console.error('Error al descargar la imagen de Google Drive:', error);
    return NextResponse.json(
      { error: 'Error downloading image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}