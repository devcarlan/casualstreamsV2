import syncStreams from '@/app/lib/syncStreams'

export async function GET() {
  const client = process.env.CLIENT_ID
  const secret = process.env.SECRET

  if (client !== undefined && secret !== undefined) {
    try {
      const streams = await syncStreams(client, secret)

      return Response.json(streams)
    } catch (error) {
      console.log(`Error fetching stream data with error: ${error}`)
    }
  }
}
