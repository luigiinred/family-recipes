import { youTubeEmbedUrl } from '@/lib/youtube/isYouTubeRecipe';
import styles from './YouTubeRecipePlayer.module.css';

type YouTubeRecipePlayerProps = {
  videoId: string;
  title: string;
  startSeconds: number;
  autoplay?: boolean;
};

export function YouTubeRecipePlayer({
  videoId,
  title,
  startSeconds,
  autoplay = false,
}: YouTubeRecipePlayerProps) {
  const origin = typeof window !== 'undefined' ? window.location.origin : undefined;
  const src = youTubeEmbedUrl(videoId, startSeconds, { autoplay, origin });

  return (
    <div className={styles.wrap}>
      <iframe
        key={`${videoId}-${startSeconds}`}
        className={styles.frame}
        src={src}
        title={title}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
}
