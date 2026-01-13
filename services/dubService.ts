import { UTMState, DubResponse } from '../types';

/**
 * NOTE:
 * Dub.sh API must be called from a backend (Cloud Function).
 * This frontend implementation is in a holding state
 * while billing approval is pending.
 */
const BACKEND_URL = 'https://create-dub-link-1024194900952.europe-west1.run.app';


/**
 * Constructs the full URL with UTM parameters
 */  
export const constructLongUrl = (state: UTMState): string => {
  const url = new URL(
    state.baseUrl.startsWith('http')
      ? state.baseUrl
      : `https://${state.baseUrl}`
  );

  url.searchParams.set('utm_source', state.source);
  url.searchParams.set('utm_medium', state.medium);
  url.searchParams.set('utm_campaign', state.campaign);

  if (state.content.trim()) {
    url.searchParams.set('utm_content', state.content.trim());
  }

  if (state.id.trim()) {
    url.searchParams.set('utm_id', state.id.trim());
  }

  return url.toString();
};

/**
 * Requests a shortened link from the backend (Cloud Function)
 */
export const generateShortLink = async (
  longUrl: string,
  metadata: UTMState
): Promise<DubResponse> => {
  if (!BACKEND_URL) {
    throw new Error(
      'Short link service is not yet configured. Backend integration pending approval.'
    );
  }

  try {
    const response = await fetch(BACKEND_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ url: longUrl }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData?.error || 'Failed to generate short link'
      );
    }

    const data = await response.json();

    return {
      shortLink: data.shortLink,
      longUrl,
      createdAt: new Date().toISOString(),
      metadata,
    };
  } catch (error) {
    console.error('Short link generation error:', error);
    throw error;
  }
};
