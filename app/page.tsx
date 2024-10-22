'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, AlertCircle } from 'lucide-react'

interface ImageVariant {
  url: string
  effect: string
}

interface TweetData {
  nombreFoto: string
  textoTweet: string
  estado: string
  imageVariants: ImageVariant[]
}

export default function XRepostBot() {
  const [tweetData, setTweetData] = useState<TweetData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)

  const fetchTweetData = async () => {
    setLoading(true)
    setError(null)
    setTweetData(null)
    setSelectedImage(null)

    try {
      const response = await fetch('/api/getNextPendingTweet')
      if (!response.ok) {
        throw new Error('Failed to fetch tweet data')
      }
      const tweet: Omit<TweetData, 'imageVariants'> = await response.json()

      if (tweet) {
        const imageResponse = await fetch(`/api/processImage?fileName=${encodeURIComponent(tweet.nombreFoto)}`)
        if (!imageResponse.ok) {
          throw new Error('Failed to process image')
        }
        const imageVariants: ImageVariant[] = await imageResponse.json()

        const fullTweetData: TweetData = { ...tweet, imageVariants }
        setTweetData(fullTweetData)
        setSelectedImage(imageVariants[0].url) // Select the original image by default
      } else {
        setError('No se encontraron tweets pendientes')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al procesar el tweet')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleImageSelect = (imageUrl: string) => {
    setSelectedImage(imageUrl)
  }

  const handleTweet = async () => {
    if (!tweetData || !selectedImage) {
      setError('Por favor, selecciona una imagen antes de twittear')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const response = await fetch('/api/postTweet', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          textoTweet: tweetData.textoTweet,
          imageUrl: selectedImage,
          nombreFoto: tweetData.nombreFoto,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to post tweet')
      }

      const result = await response.json()
      console.log('Tweet posted successfully:', result)
      
      // Reset the UI after successful tweet
      setTweetData(null)
      setSelectedImage(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al publicar el tweet')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-6 text-center">X Repost Bot</h1>
      
      <div className="flex justify-center mb-6">
        <Button onClick={fetchTweetData} disabled={loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Procesando...
            </>
          ) : (
            'Procesar Tweet'
          )}
        </Button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}

      {tweetData && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Tweet Text:</h2>
          <p className="bg-gray-100 p-4 rounded-md mb-4">{tweetData.textoTweet}</p>

          <h2 className="text-xl font-semibold mt-4 mb-2">Imágenes Procesadas:</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {tweetData.imageVariants.map((variant, index) => (
              <Card 
                key={index}
                className={`cursor-pointer ${selectedImage === variant.url ? 'ring-2 ring-blue-500' : ''}`}
                onClick={() => handleImageSelect(variant.url)}
              >
                <CardContent className="p-4">
                  <h3 className="text-lg font-medium mb-2">{variant.effect}</h3>
                  <div className="relative w-full h-48">
                    <img 
                      src={variant.url} 
                      alt={`${variant.effect} - ${tweetData.nombreFoto}`} 
                      className="w-full h-full object-cover rounded-md"
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="mt-6 flex justify-center">
            <Button onClick={handleTweet} disabled={!selectedImage || loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Publicando...
                </>
              ) : (
                'Publicar Tweet'
              )}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}