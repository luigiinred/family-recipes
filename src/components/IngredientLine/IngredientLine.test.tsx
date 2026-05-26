import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { IngredientLine } from './IngredientLine';

describe('IngredientLine', () => {
  it('renders amount, unit, and name with consistent unit casing', () => {
    const { container } = render(
      <IngredientLine ingredient={{ amount: '2', unit: 'tbsp', name: 'Olive Oil' }} />,
    );
    expect(container.textContent).toBe('2 Tbsp olive oil');
    expect(screen.getByText('Tbsp').className).toMatch(/unit/);
  });
});
