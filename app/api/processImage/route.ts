import { NextRequest, NextResponse } from 'next/server';
import { downloadImage } from '@/lib/googleDrive';
import { put } from '@vercel/blob';
import sharp from 'sharp';

export async function GET(request: NextRequest) {
  const fileName = request.nextUrl.searchParams.get('fileName');

  if (!fileName) {
    return NextResponse.json({ error: 'File name is required' }, { status: 400 });
  }

  try {
    const imageBuffer = await downloadImage(fileName);

    const variants = await Promise.all([
      { effect: 'Original', buffer: imageBuffer },
      { effect: 'Grayscale', buffer: await applyGrayscale(imageBuffer) },
      { effect: 'Sepia', buffer: await applySepia(imageBuffer) },
      { effect: 'Blur', buffer: await applyBlur(imageBuffer) },
    ].map(async (variant) => ({
      effect: variant.effect,
      url: await uploadImage(variant.buffer, `${variant.effect.toLowerCase()}_${fileName}`)
    })));

    return NextResponse.json(variants);
  } catch (error) {
    console.error('Error processing image:', error);
    return NextResponse.json(
      { error: 'Error processing image', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

async function uploadImage(buffer: Buffer, fileName: string): Promise<string> {
  const blob = await put(fileName, buffer, { access: 'public' });
  return blob.url;
}

async function applyGrayscale(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer).grayscale().toBuffer();
}

async function applySepia(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .tint({ r: 112, g: 66, b: 20 })
    .toBuffer();
}

async function applyBlur(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .blur(5)
    .toBuffer();
}