import { NextRequest, NextResponse } from 'next/server';
import { getNextPendingTweet } from '../../../lib/googleSheets';

export async function GET(request: NextRequest) {
  try {
    console.log('API function called');
    
    const tweetData = await getNextPendingTweet();
    
    if (tweetData) {
      console.log('Tweet pendiente encontrado:', tweetData);
      // Aquí puedes agregar la lógica para procesar el tweet
      
      return NextResponse.json({ 
        message: 'Tweet pendiente encontrado',
        tweetData 
      });
    } else {
      return NextResponse.json({ message: 'No hay tweets pendientes' });
    }
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}