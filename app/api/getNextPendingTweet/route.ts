import { NextResponse } from 'next/server';
import { getNextPendingTweet } from '@/lib/googleSheets';

export async function GET() {
  console.log('API route: Attempting to fetch next pending tweet');
  try {
    const tweet = await getNextPendingTweet();
    console.log('Tweet fetched successfully:', tweet);
    return NextResponse.json(tweet);
  } catch (error) {
    console.error('Error fetching next pending tweet:', error);
    
    let errorMessage = 'An unknown error occurred';
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    return NextResponse.json(
      { error: 'Failed to fetch tweet data', details: errorMessage },
      { status: 500 }
    );
  }
}