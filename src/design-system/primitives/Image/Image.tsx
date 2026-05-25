import styles from './Image.module.css';

type ImageProps = {
  src?: string;
  alt: string;
  fallbackLabel?: string;
  className?: string;
};

export function Image({ src, alt, fallbackLabel, className }: ImageProps) {
  if (src?.trim()) {
    return <img className={[styles.image, className].filter(Boolean).join(' ')} src={src} alt={alt} />;
  }
  const label = (fallbackLabel ?? alt).trim().charAt(0).toUpperCase() || '?';
  return (
    <div
      className={[styles.placeholder, className].filter(Boolean).join(' ')}
      role="img"
      aria-label={alt}
    >
      {label}
    </div>
  );
}
