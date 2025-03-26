import syncStreams from '@/app/lib/syncStreams'
import { NextResponse } from 'next/server'

export async function GET() {
  const client = process.env.CLIENT_ID
  const secret = process.env.SECRET

  if (client !== undefined && secret !== undefined) {
    try {
      const streams = await syncStreams(client, secret)

      return NextResponse.json({ streams: streams }, { status: 200 })
    } catch (error) {
      console.log(`Error fetching stream data with error: ${error}`)

      return NextResponse.json({ error: error }, { status: 500 })
    }
  }
}
