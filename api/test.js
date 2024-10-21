module.exports = (req, res) => {
  console.log('API test function called');
  res.status(200).json({ message: 'API test is working' });
};