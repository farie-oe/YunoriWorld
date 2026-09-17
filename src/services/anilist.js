const ANILIST_ENDPOINT = 'https://graphql.anilist.co'

// AniList's Page.media caps perPage at 50, so id lookups are chunked.
const GENRE_LOOKUP_CHUNK_SIZE = 50

const GENRES_BY_IDS_QUERY = `
  query GenresByIds($ids: [Int], $perPage: Int) {
    Page(page: 1, perPage: $perPage) {
      media(id_in: $ids, type: ANIME) {
        id
        genres
      }
    }
  }
`

const SEARCH_ANIME_QUERY = `
  query SearchAnime($search: String, $page: Int, $perPage: Int) {
    Page(page: $page, perPage: $perPage) {
      media(search: $search, type: ANIME, sort: SEARCH_MATCH) {
        id
        title {
          romaji
          english
        }
        coverImage {
          large
          medium
        }
        description(asHtml: false)
        genres
        averageScore
        episodes
        status
        season
        seasonYear
      }
    }
  }
`

function mapMedia(media) {
  return {
    id: media.id,
    title: {
      romaji: media.title?.romaji ?? null,
      english: media.title?.english ?? null,
    },
    coverImage: media.coverImage?.large ?? media.coverImage?.medium ?? null,
    description: media.description ?? null,
    genres: Array.isArray(media.genres) ? media.genres : [],
    averageScore: media.averageScore ?? null,
    episodes: media.episodes ?? null,
    status: media.status ?? null,
    season: media.season ?? null,
    seasonYear: media.seasonYear ?? null,
  }
}

/**
 * Searches AniList for anime matching the given title query.
 * Returns an array of simplified anime objects (empty array if the
 * query is blank or no results are found).
 */
export async function searchAnime(query, { perPage = 10 } = {}) {
  const trimmedQuery = typeof query === 'string' ? query.trim() : ''

  if (!trimmedQuery) {
    return []
  }

  let response
  try {
    response = await fetch(ANILIST_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        query: SEARCH_ANIME_QUERY,
        variables: {
          search: trimmedQuery,
          page: 1,
          perPage,
        },
      }),
    })
  } catch {
    throw new Error('Unable to reach AniList. Please check your connection and try again.')
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new Error('AniList returned an unexpected response.')
  }

  if (!response.ok || payload?.errors) {
    const message = payload?.errors?.[0]?.message || `AniList request failed (${response.status}).`
    throw new Error(message)
  }

  const media = payload?.data?.Page?.media

  if (!Array.isArray(media)) {
    throw new Error('AniList returned an unexpected response.')
  }

  return media.map(mapMedia)
}

/**
 * Looks up the official AniList genres for a set of existing AniList media
 * ids — used to backfill genres for anime_entries rows that were saved
 * before the genres column existed. Requests are chunked to stay within
 * AniList's perPage limit and sent one chunk at a time to stay well under
 * its rate limit. Returns a { [anilistId]: string[] } map; ids AniList has
 * no genre data for are simply absent from the result (never invented).
 */
export async function fetchGenresByAnilistIds(anilistIds) {
  const uniqueIds = [...new Set(anilistIds)].filter((id) => Number.isInteger(id))
  if (uniqueIds.length === 0) return {}

  const genresById = {}

  for (let start = 0; start < uniqueIds.length; start += GENRE_LOOKUP_CHUNK_SIZE) {
    const chunk = uniqueIds.slice(start, start + GENRE_LOOKUP_CHUNK_SIZE)

    let response
    try {
      response = await fetch(ANILIST_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          query: GENRES_BY_IDS_QUERY,
          variables: { ids: chunk, perPage: chunk.length },
        }),
      })
    } catch {
      throw new Error('Unable to reach AniList. Please check your connection and try again.')
    }

    let payload
    try {
      payload = await response.json()
    } catch {
      throw new Error('AniList returned an unexpected response.')
    }

    if (!response.ok || payload?.errors) {
      const message = payload?.errors?.[0]?.message || `AniList request failed (${response.status}).`
      throw new Error(message)
    }

    const media = payload?.data?.Page?.media
    if (Array.isArray(media)) {
      media.forEach((item) => {
        genresById[item.id] = Array.isArray(item.genres) ? item.genres : []
      })
    }
  }

  return genresById
}
