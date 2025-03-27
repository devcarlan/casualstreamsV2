export const syncStreams = async (client: string, secret: string) => {
  // get credentials
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${client}&client_secret=${secret}&grant_type=client_credentials`,
    {
      method: 'POST',
    }
  )

  const access = await res.json()

  // get live streams
  const getStreams = async (after?: string) => {
    const res = await fetch(
      `https://api.twitch.tv/helix/streams?first=100${
        after ? `&after=${after}` : ''
      }`,
      {
        method: 'GET',
        headers: {
          'Client-ID': client,
          Authorization: 'Bearer ' + access.access_token,
        },
      }
    )

    return await res.json()
  }

  const getCasuals = async (
    after?: string,
    result: any[] = [],
    collecting = false
  ) => {
    const streams = await getStreams(after)
    if (!streams.data.length) return result

    // check positions
    const firstViewerCount = streams.data[0]?.viewer_count ?? Infinity
    const midIndex = Math.floor(streams.data.length / 2)
    const midViewerCount = streams.data[midIndex]?.viewer_count ?? Infinity
    const lastIndex = streams.data.length - 1
    const lastViewerCount = streams.data[lastIndex]?.viewer_count ?? Infinity

    if (!collecting) {
      if (
        firstViewerCount > 50 &&
        midViewerCount > 50 &&
        lastViewerCount > 50
      ) {
        if (!streams.pagination.cursor) return result
        return getCasuals(streams.pagination.cursor, result, false)
      }

      // find the first stream with exactly 50 viewers
      const hasFiftyViewersIndex = streams.data.findIndex(
        (stream: any) => stream.viewer_count === 50
      )

      if (hasFiftyViewersIndex !== -1) {
        const newResult = streams.data.slice(hasFiftyViewersIndex)
        return getCasuals(
          streams.pagination.cursor,
          [...result, ...newResult],
          true
        )
      }

      // continue searching after finding first stream with 50 viewers
      return getCasuals(streams.pagination.cursor, result, false)
    }

    // keep adding streams until stream found with less than 49 viewers
    const stoppingPoint = streams.data.findIndex(
      (stream) => stream.viewer_count < 49
    )
    const collectedBatch =
      stoppingPoint === -1 ? streams.data : streams.data.slice(0, stoppingPoint)

    const newResult = [...result, ...collectedBatch]

    if (stoppingPoint !== -1 || !streams.pagination.cursor) return newResult

    return getCasuals(streams.pagination.cursor, newResult, true)
  }

  return await getCasuals()
}

export default syncStreams
