
import { UTMState, DubResponse } from '../types';

/**
 * Backend Cloud Function endpoint.
 * This should be configured via environment variables in Vercel/Netlify for scalability.
 */
const BACKEND_URL = 'https://create-dub-link-1024194900952.europe-west1.run.app';

/**
 * Constructs the full URL with UTM parameters
 */  
export const constructLongUrl = (state: UTMState): string => {
  try {
    const url = new URL(
      state.baseUrl.startsWith('http')
        ? state.baseUrl
        : `https://${state.baseUrl}`
    );

    url.searchParams.set('utm_source', state.source);
    url.searchParams.set('utm_medium', state.medium);
    url.searchParams.set('utm_campaign', state.campaign);

    if (state.content?.trim()) {
      url.searchParams.set('utm_content', state.content.trim());
    }

    if (state.id?.trim()) {
      url.searchParams.set('utm_id', state.id.trim());
    }

    return url.toString();
  } catch (e) {
    console.error("URL Construction failed", e);
    return state.baseUrl;
  }
};

/**
 * Requests a shortened link from the backend (Cloud Function)
 */
export const generateShortLink = async (
  longUrl: string,
  metadata: UTMState
): Promise<DubResponse> => {
  if (!BACKEND_URL) {
    throw new Error('Short link service (BACKEND_URL) is not configured in the environment.');
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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData?.error || `Service returned status ${response.status}`);
    }

    const data = await response.json();

    return {
      shortLink: data.shortLink,
      longUrl,
      createdAt: new Date().toISOString(),
      metadata,
    };
  } catch (error: any) {
    console.error('Short link generation error:', error);
    // In test environment, if the backend fails, we show the long URL as a fallback or throw error
    throw new Error(error.message || 'The link shortening service is currently unavailable.');
  }
};
