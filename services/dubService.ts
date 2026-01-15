
import { UTMState, DubResponse } from '../types';

/**
 * Backend Cloud Function endpoint.
 */
const BACKEND_URL = 'https://create-dub-link-1024194900952.europe-west1.run.app';

/**
 * Constructs the full URL with UTM parameters and additional custom parameters
 */  
export const constructLongUrl = (state: UTMState, isSocialFlow: boolean): string => {
  try {
    let urlString = state.baseUrl.trim();
    if (!urlString.startsWith('http')) {
      urlString = `https://${urlString}`;
    }

    const url = new URL(urlString);

    if (isSocialFlow) {
      if (state.source) url.searchParams.set('utm_source', state.source);
      if (state.medium) url.searchParams.set('utm_medium', state.medium);
      if (state.campaign) url.searchParams.set('utm_campaign', state.campaign);
      if (state.content?.trim()) url.searchParams.set('utm_content', state.content.trim());
      if (state.id?.trim()) url.searchParams.set('utm_id', state.id.trim());
    }

    // Add unlimited additional parameters
    state.additionalParams.forEach(param => {
      if (param.key.trim() && param.value.trim()) {
        url.searchParams.set(param.key.trim(), param.value.trim());
      }
    });

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
    throw new Error(error.message || 'The link shortening service is currently unavailable.');
  }
};
