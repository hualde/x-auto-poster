const { downloadImage } = require('../googleDrive');

module.exports = async (req, res) => {
  try {
    console.log('Iniciando prueba de descarga de imagen');

    // Obtén el nombre del archivo de la query string
    const fileName = req.query.fileName;

    if (!fileName) {
      return res.status(400).json({ error: 'Se requiere el parámetro fileName' });
    }

    console.log(`Intentando descargar: ${fileName}`);

    const imageBuffer = await downloadImage(fileName);

    console.log(`Imagen descargada exitosamente. Tamaño: ${imageBuffer.length} bytes`);

    // Enviar la imagen como respuesta
    res.setHeader('Content-Type', 'image/jpeg');
    res.setHeader('Content-Length', imageBuffer.length);
    res.send(imageBuffer);

  } catch (error) {
    console.error('Error en la prueba de descarga de imagen:', error);
    res.status(500).json({ error: error.message });
  }
};