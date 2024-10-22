import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { put } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { getNextPendingTweet, updateTweetStatus } from '../../../lib/googleSheets';
import { downloadImage } from '../../../lib/googleDrive';

// Definición de filtros
const filters = [
  {
    name: 'Original',
    apply: (image) => image,
  },
  {
    name: 'Grayscale',
    apply: (image) => image.grayscale(),
  },
  {
    name: 'Sepia',
    apply: (image) => image.sepia(),
  },
  {
    name: 'Blur',
    apply: (image) => image.blur(5),
  },
];

async function applyFilters(imageBuffer) {
  console.log('Aplicando filtros...');
  const filteredImages = await Promise.all(filters.map(async (filter) => {
    try {
      console.log(`Aplicando filtro: ${filter.name}`);
      const processedBuffer = await filter.apply(sharp(imageBuffer))
        .resize(800, 800, { fit: 'inside' })
        .toBuffer();
      console.log(`Filtro ${filter.name} aplicado con éxito`);
      
      // Subir la imagen procesada al almacenamiento de Vercel
      const filename = `${uuidv4()}-${filter.name}.jpg`;
      const { url } = await put(filename, processedBuffer, { access: 'public' });
      
      return {
        name: filter.name,
        url: url
      };
    } catch (error) {
      console.error(`Error applying filter ${filter.name}:`, error);
      return {
        name: filter.name,
        error: error.message
      };
    }
  }));
  console.log(`Total de filtros aplicados: ${filteredImages.length}`);
  return filteredImages;
}

export async function GET(request) {
  try {
    console.log('Iniciando procesamiento de tweet');
    const tweetData = await getNextPendingTweet();
    
    if (!tweetData) {
      console.log('No se encontraron tweets pendientes');
      return NextResponse.json({ message: 'No hay tweets pendientes' });
    }

    console.log('Tweet data:', tweetData);

    const imageBuffer = await downloadImage(tweetData.nombreFoto);
    console.log('Imagen descargada');

    const filteredImages = await applyFilters(imageBuffer);

    // Actualizar el estado del tweet a 'procesado'
    await updateTweetStatus(tweetData.nombreFoto, 'procesado');

    return NextResponse.json({ 
      message: 'Imágenes procesadas y listas para selección',
      tweetData: {
        text: tweetData.textoTweet,
        images: filteredImages
      }
    });
  } catch (error) {
    console.error('Error en el procesamiento del tweet:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const { selectedImage, tweetText } = body;

    if (!selectedImage || !tweetText) {
      return NextResponse.json({ error: 'Se requiere imagen seleccionada y texto del tweet' }, { status: 400 });
    }

    // Aquí iría la lógica para publicar el tweet
    // Por ahora, solo simularemos la publicación

    console.log('Simulando publicación de tweet:', { selectedImage, tweetText });

    // Actualizar el estado del tweet a 'publicado'
    await updateTweetStatus(selectedImage.name, 'publicado');

    return NextResponse.json({ message: 'Tweet publicado con éxito' });
  } catch (error) {
    console.error('Error al publicar el tweet:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}