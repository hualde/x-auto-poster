const { getNextPendingTweet } = require('../../lib/googleSheets');
// Importa otras funciones necesarias aquí

module.exports = async (req, res) => {
  try {
    console.log('API function called');
    
    const tweetData = await getNextPendingTweet();
    
    if (tweetData) {
      console.log('Tweet pendiente encontrado:', tweetData);
      // Aquí puedes agregar la lógica para procesar el tweet
      // Por ejemplo, descargar la imagen, preparar el tweet, etc.
      
      res.status(200).json({ 
        message: 'Tweet pendiente encontrado',
        tweetData 
      });
    } else {
      res.status(200).json({ message: 'No hay tweets pendientes' });
    }
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
};