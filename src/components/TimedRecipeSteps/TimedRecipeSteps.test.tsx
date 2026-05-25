import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TimedRecipeSteps } from './TimedRecipeSteps';

const steps = [
  { text: 'Prep vegetables', startSeconds: 45 },
  { text: 'Roast in oven', startSeconds: 312 },
];

describe('TimedRecipeSteps', () => {
  it('lists steps with timestamps', () => {
    render(<TimedRecipeSteps steps={steps} onSeek={vi.fn()} />);
    expect(screen.getByRole('button', { name: /prep vegetables/i })).toBeInTheDocument();
    expect(screen.getByText('0:45')).toBeInTheDocument();
    expect(screen.getByText('5:12')).toBeInTheDocument();
  });

  it('calls onSeek with start seconds when a step is clicked', async () => {
    const user = userEvent.setup();
    const onSeek = vi.fn();
    render(<TimedRecipeSteps steps={steps} onSeek={onSeek} />);
    await user.click(screen.getByRole('button', { name: /roast in oven/i }));
    expect(onSeek).toHaveBeenCalledWith(312);
  });
});
