import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { RecipeStepContent } from './RecipeStepContent';

describe('RecipeStepContent', () => {
  it('shows ingredient chips above the instruction', () => {
    render(
      <RecipeStepContent
        text={
          'Uses: olive oil · paprika\n\nStir in the spices and toast until aromatic.'
        }
      />,
    );
    expect(screen.getByLabelText(/ingredients for this step/i)).toBeInTheDocument();
    expect(screen.getByText('olive oil')).toBeInTheDocument();
    expect(screen.getByText('paprika')).toBeInTheDocument();
    expect(screen.getByText(/Stir in the spices/)).toBeInTheDocument();
  });

  it('bolds linked ingredients in the instruction with hover cards', () => {
    render(
      <RecipeStepContent
        text="Stir in chicken stock and simmer."
        ingredients={[{ amount: '1/4', unit: 'cup', name: 'chicken stock' }]}
      />,
    );
    const mention = screen.getByText('chicken stock');
    expect(mention.tagName).toBe('STRONG');
    expect(mention).toHaveClass(/mention/);
  });
});
