import { Card, Image, Stack, Text } from '@/design-system/primitives';
import { FoodIdeaMeta } from '@/components/FoodIdeaMeta/FoodIdeaMeta';
import { recipeImageUrl } from '@/lib/recipeImageUrl';
import type { FoodIdea } from '@/static-api/types/foodIdea';
import styles from './FoodIdeaCard.module.css';

type FoodIdeaCardProps = {
  idea: FoodIdea;
};

export function FoodIdeaCard({ idea }: FoodIdeaCardProps) {
  return (
    <Card as="li" className={styles.card}>
      <div className={styles.surface}>
        <div className={styles.media}>
          <Image src={recipeImageUrl(idea.imageUrl)} alt={idea.title} />
        </div>
        <Stack gap="sm" className={styles.body}>
          <Text as="h2" variant="subtitle">
            {idea.title}
          </Text>
          <FoodIdeaMeta idea={idea} />
        </Stack>
      </div>
    </Card>
  );
}
