const { getNextPendingTweet, updateTweetStatus } = require('../googleSheets');
const { downloadImage } = require('../googleDrive');
const sharp = require('sharp');

async function applyRandomFilter(imageBuffer) {
  const filters = [
    img => img.greyscale(),
    img => img.sepia(),
    img => img.negate(),
    img => img.tint({ r: 255, g: 0, b: 0 }),
    img => img.tint({ r: 0, g: 255, b: 0 }),
    img => img.tint({ r: 0, g: 0, b: 255 }),
    img => img.blur(5),
    img => img.sharpen(),
    img => img.modulate({ brightness: 1.5 }),
    img => img.modulate({ saturation: 2 })
  ];

  const randomFilter = filters[Math.floor(Math.random() * filters.length)];
  return randomFilter(sharp(imageBuffer)).toBuffer();
}

module.exports = async (req, res) => {
  try {
    console.log('Iniciando procesamiento de tweet');

    // 1. Obtener el próximo tweet pendiente
    const tweetData = await getNextPendingTweet();
    
    if (!tweetData) {
      return res.status(200).json({ message: 'No hay tweets pendientes' });
    }

    console.log('Tweet pendiente encontrado:', tweetData);

    // 2. Descargar la imagen asociada
    const imageBuffer = await downloadImage(tweetData.nombreFoto);
    console.log(`Imagen descargada: ${tweetData.nombreFoto}`);

    // 3. Aplicar un filtro aleatorio a la imagen
    const processedImageBuffer = await applyRandomFilter(imageBuffer);
    console.log('Filtro aplicado a la imagen');

    // 4. Preparar el tweet para publicación (simulado por ahora)
    const tweetToPost = {
      text: tweetData.textoTweet,
      image: processedImageBuffer
    };
    console.log('Tweet preparado para publicación');

    // Aquí iría la lógica para publicar el tweet
    // Por ahora, solo simularemos este paso
    console.log('Simulando publicación del tweet:', tweetToPost.text);

    // 5. Actualizar el estado del tweet en la hoja de cálculo
    await updateTweetStatus(tweetData.nombreFoto, 'publicado');
    console.log('Estado del tweet actualizado a "publicado"');

    res.status(200).json({ 
      message: 'Tweet procesado y listo para publicar',
      tweetData: {
        text: tweetToPost.text,
        imageSize: tweetToPost.image.length,
        filterApplied: 'Aleatorio'
      }
    });
  } catch (error) {
    console.error('Error en el procesamiento del tweet:', error);
    res.status(500).json({ error: error.message });
  }
};