/** Extract an 11-character YouTube video id from common URL shapes. */
export function parseYouTubeVideoId(url: string): string | undefined {
  if (!url?.trim()) return undefined;

  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');

    if (host === 'youtu.be') {
      const id = parsed.pathname.slice(1).split('/')[0];
      return id.length === 11 ? id : undefined;
    }

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      if (parsed.pathname.startsWith('/shorts/')) {
        const id = parsed.pathname.split('/')[2];
        return id?.length === 11 ? id : undefined;
      }
      const v = parsed.searchParams.get('v');
      return v && v.length === 11 ? v : undefined;
    }
  } catch {
    return undefined;
  }

  return undefined;
}
