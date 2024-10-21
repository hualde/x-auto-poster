import { getNextPendingTweet } from '../googleSheets';
import { downloadImage } from '../googleDrive';

export default async function handler(req, res) {
  try {
    console.log('Testing Google Sheets integration...');
    const tweetData = await getNextPendingTweet();
    if (tweetData) {
      console.log('Successfully retrieved tweet data from Google Sheets:');
      console.log(tweetData);
    } else {
      console.log('No pending tweets found in Google Sheets.');
    }

    let imageInfo = null;
    if (tweetData && tweetData.photoName) {
      console.log('\nTesting Google Drive integration...');
      const imagePath = await downloadImage(tweetData.photoName);
      console.log(`Image downloaded successfully: ${imagePath}`);
      imageInfo = { path: imagePath, name: tweetData.photoName };
    }

    res.status(200).json({
      message: 'Test completed successfully',
      tweetData: tweetData,
      imageInfo: imageInfo
    });
  } catch (error) {
    console.error('Error during testing:', error);
    res.status(500).json({ error: error.message });
  }
}