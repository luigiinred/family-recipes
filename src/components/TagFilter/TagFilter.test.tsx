import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { TagFilter } from './TagFilter';

describe('TagFilter', () => {
  it('offers tag suggestions and calls onChange', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<TagFilter tags={['soup', 'salad']} value="" onChange={onChange} />);
    const input = screen.getByRole('combobox', { name: /filter by tag/i });
    await user.type(input, 'so');
    expect(onChange).toHaveBeenCalled();
    expect(input).toHaveAttribute('list');
  });
});
