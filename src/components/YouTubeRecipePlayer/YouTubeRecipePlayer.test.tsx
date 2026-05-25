import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { YouTubeRecipePlayer } from './YouTubeRecipePlayer';

describe('YouTubeRecipePlayer', () => {
  it('renders an embedded iframe for the video id', () => {
    render(
      <YouTubeRecipePlayer
        videoId="dQw4w9WgXcQ"
        title="Demo video"
        startSeconds={0}
      />,
    );
    const frame = screen.getByTitle('Demo video');
    expect(frame).toHaveAttribute(
      'src',
      expect.stringContaining('youtube.com/embed/dQw4w9WgXcQ'),
    );
  });

  it('requests autoplay in the embed URL when autoplay is enabled', () => {
    render(
      <YouTubeRecipePlayer
        videoId="dQw4w9WgXcQ"
        title="Demo video"
        startSeconds={45}
        autoplay
      />,
    );
    expect(screen.getByTitle('Demo video')).toHaveAttribute(
      'src',
      expect.stringMatching(/autoplay=1/),
    );
  });

  it('updates embed start time when startSeconds changes', () => {
    const { rerender } = render(
      <YouTubeRecipePlayer
        videoId="dQw4w9WgXcQ"
        title="Demo video"
        startSeconds={10}
      />,
    );
    expect(screen.getByTitle('Demo video')).toHaveAttribute(
      'src',
      expect.stringContaining('start=10'),
    );
    rerender(
      <YouTubeRecipePlayer
        videoId="dQw4w9WgXcQ"
        title="Demo video"
        startSeconds={120}
      />,
    );
    expect(screen.getByTitle('Demo video')).toHaveAttribute(
      'src',
      expect.stringContaining('start=120'),
    );
  });
});
