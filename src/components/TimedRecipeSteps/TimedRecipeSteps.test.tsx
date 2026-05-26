import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TimedRecipeSteps } from './TimedRecipeSteps';

const steps = [
  {
    text: 'Make the dressing: whisk olive oil, lemon, garlic, and mustard in a small bowl.',
    startSeconds: 118,
  },
  {
    text: 'Mix the salad: combine chicken, shallots, celery, and artichokes in a large bowl.',
    startSeconds: 32,
  },
];

describe('TimedRecipeSteps', () => {
  it('shows full instruction text readable without clicking', () => {
    render(<TimedRecipeSteps steps={steps} onSeek={vi.fn()} />);
    expect(
      screen.getByText(/make the dressing: whisk olive oil/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/mix the salad: combine chicken/i)).toBeInTheDocument();
  });

  it('seeks the video when the step or watch-at control is clicked', async () => {
    const user = userEvent.setup();
    const onSeek = vi.fn();
    render(<TimedRecipeSteps steps={steps} onSeek={onSeek} />);
    await user.click(screen.getByRole('button', { name: /play video at 1:58/i }));
    expect(onSeek).toHaveBeenCalledWith(118);

    await user.click(
      screen.getByRole('button', { name: /play video at 0:32: mix the salad/i }),
    );
    expect(onSeek).toHaveBeenCalledWith(32);
  });
});
