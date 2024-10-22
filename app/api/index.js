module.exports = (req, res) => {
    console.log('Root API called');
    res.status(200).json({ message: 'Root API is working' });
  };