/**
 * One-off catalog builder from personal notes. Re-run to regenerate recipes.json.
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, '..');

function recipe({
  id,
  slug,
  title,
  description,
  mealLists = [],
  tags = [],
  sourceUrl,
  notes,
  servings = 4,
  prepMinutes = 0,
  cookMinutes = 0,
  ingredients = [],
  steps = ['See source link or add steps when you cook this.'],
}) {
  return {
    id: String(id),
    slug,
    title,
    description,
    imageUrl: '',
    prepMinutes,
    cookMinutes,
    servings,
    tags,
    ingredients,
    steps,
    ...(sourceUrl ? { sourceUrl } : {}),
    ...(mealLists.length ? { mealLists } : {}),
    ...(notes ? { notes } : {}),
  };
}

const recipes = [
  // —— Upcoming: To Make ——
  recipe({ id: 1, slug: 'caesar-salad', title: 'Caesar Salad', description: 'Classic Caesar salad — plan to make 2 batches.', mealLists: ['to-make'], tags: ['salad'], notes: 'Make x2' }),
  recipe({ id: 2, slug: 'mediterranean-salad', title: 'Mediterranean Salad', description: 'Fresh Mediterranean-style salad.', mealLists: ['to-make'], tags: ['salad', 'mediterranean'] }),
  recipe({ id: 3, slug: 'air-fried-veggies-tilapia', title: 'Air Fried Veggies and Tilapia', description: 'Air fryer tilapia with mixed vegetables.', mealLists: ['to-make'], tags: ['air-fryer', 'fish', 'low-carb'] }),
  recipe({ id: 4, slug: 'air-fried-veggies-shrimp', title: 'Air Fried Veggies and Shrimp', description: 'Air fryer shrimp with mixed vegetables.', mealLists: ['to-make'], tags: ['air-fryer', 'seafood'] }),
  recipe({ id: 5, slug: 'zero-calorie-pasta-veggies-shrimp', title: 'Zero Calorie Pasta with Veggies and Shrimp', description: 'Shirataki or zero-cal pasta with shrimp and vegetables.', mealLists: ['to-make'], tags: ['low-carb', 'seafood', 'pasta'] }),
  recipe({ id: 6, slug: 'crema-salad', title: 'Crema Salad', description: 'Crema-style salad (from your meal plan).', mealLists: ['to-make'], tags: ['salad'] }),
  recipe({ id: 7, slug: 'falafel', title: 'Falafel', description: 'Homemade or prepared falafel.', mealLists: ['to-make'], tags: ['vegetarian', 'mediterranean'] }),

  // —— Upcoming: To Eat ——
  recipe({ id: 8, slug: 'freezer-soup', title: 'Freezer Soup', description: 'Soup from the freezer — ready to heat and eat.', mealLists: ['to-eat', 'freezer-meals'], tags: ['soup', 'freezer'] }),

  // —— Healthy Ideas ——
  recipe({ id: 9, slug: 'briam', title: 'Briam (Greek Roasted Vegetables)', description: 'Greek briam — roasted summer vegetables.', mealLists: ['healthy-ideas', 'saved'], tags: ['greek', 'vegetarian', 'mediterranean'], sourceUrl: 'https://www.themediterraneandish.com/briam-greek-roasted-vegetables/', prepMinutes: 20, cookMinutes: 60 }),
  recipe({ id: 10, slug: 'gigantes-butter-beans', title: 'Gigantes (Butter Beans)', description: 'Greek giant beans baked in tomato sauce.', mealLists: ['healthy-ideas'], tags: ['greek', 'vegetarian', 'beans'] }),
  recipe({ id: 11, slug: 'bean-chili', title: 'Bean Chili', description: 'Hearty bean chili.', mealLists: ['healthy-ideas'], tags: ['vegetarian', 'beans', 'chili'] }),
  recipe({ id: 12, slug: 'ratatouille', title: 'Ratatouille', description: 'French Provençal stewed vegetables.', mealLists: ['healthy-ideas'], tags: ['vegetarian', 'french'] }),
  recipe({ id: 13, slug: 'orzo-salad', title: 'Orzo Salad', description: 'Orzo pasta salad.', mealLists: ['healthy-ideas'], tags: ['salad', 'pasta', 'mediterranean'] }),
  recipe({ id: 14, slug: 'pasta-primavera', title: 'Pasta Primavera', description: 'Pasta with seasonal vegetables.', mealLists: ['healthy-ideas'], tags: ['pasta', 'vegetarian'] }),
  recipe({ id: 15, slug: 'potato-tacos', title: 'Potato Tacos', description: 'Tacos filled with seasoned potatoes.', mealLists: ['healthy-ideas'], tags: ['vegetarian', 'mexican'] }),

  // —— Saved / bookmarked ——
  recipe({ id: 16, slug: 'garlic-butter-chicken-parmesan-cauliflower-rice', title: 'Garlic Butter Chicken with Parmesan Cauliflower Rice', description: 'Low-carb skillet chicken with cauliflower rice.', mealLists: ['saved'], tags: ['low-carb', 'keto', 'chicken'], sourceUrl: 'https://www.eatwell101.com/garlic-butter-chicken-with-parmesan-cauliflower-rice' }),
  recipe({ id: 17, slug: 'asian-chicken-lettuce-wraps', title: 'Asian Chicken Lettuce Wraps', description: 'Chicken lettuce wraps with Asian flavors.', mealLists: ['saved'], tags: ['asian', 'chicken', 'low-carb'] }),
  recipe({ id: 18, slug: 'bruschetta-grilled-chicken', title: 'Bruschetta Grilled Chicken', description: 'Grilled chicken topped with bruschetta-style tomato mixture.', mealLists: ['saved'], tags: ['chicken', 'grill'], sourceUrl: 'https://www.delish.com/cooking/recipe-ideas/a53594/grilled-bruschetta-chicken-recipe/' }),
  recipe({ id: 19, slug: 'salsa-chicken-lettuce-wraps', title: 'Salsa Chicken Lettuce Wraps', description: 'Salsa chicken served in lettuce cups.', mealLists: ['saved'], tags: ['chicken', 'low-carb'], sourceUrl: 'https://www.eatwell101.com/salsa-chicken-lettuce-wraps-recipe' }),
  recipe({ id: 20, slug: 'baked-shrimp', title: 'Baked Shrimp', description: 'Simple oven-baked shrimp.', mealLists: ['saved'], tags: ['seafood', 'low-carb'], sourceUrl: 'https://www.eatwell101.com/baked-shrimp-recipe' }),
  recipe({ id: 21, slug: 'garlic-butter-sausages-broccoli-skillet', title: 'Garlic Butter Sausages and Broccoli Skillet', description: 'One-pan sausages and broccoli in garlic butter.', mealLists: ['saved'], tags: ['skillet', 'low-carb'] }),
  recipe({ id: 22, slug: 'cajun-shrimp-sausage-foil-packs', title: 'Cajun Shrimp and Sausage Foil Packs', description: 'Cajun-seasoned shrimp and sausage cooked in foil.', mealLists: ['saved'], tags: ['seafood', 'cajun'], sourceUrl: 'https://www.eatwell101.com/cajun-shrimp-sausage-foil-packs-recipe' }),
  recipe({ id: 23, slug: 'creamy-garlic-parmesan-chicken-mushrooms', title: 'Creamy Garlic Parmesan Chicken with Mushrooms', description: 'Creamy skillet chicken with mushrooms and parmesan.', mealLists: ['saved'], tags: ['chicken', 'skillet'] }),
  recipe({ id: 24, slug: 'slow-cooker-lemon-garlic-chicken', title: 'Slow Cooker Lemon-Garlic Chicken Breast', description: 'Set-and-forget lemon garlic chicken in the slow cooker.', mealLists: ['saved'], tags: ['chicken', 'slow-cooker'], sourceUrl: 'https://www.thekitchn.com/recipe-slow-cooker-lemon-garlic-chicken-breast-249436' }),
  recipe({ id: 25, slug: 'greek-chicken-marinade', title: 'The Best Greek Chicken Marinade', description: 'Greek-style marinated chicken (~50 min).', mealLists: ['saved'], tags: ['greek', 'chicken', 'marinade'], prepMinutes: 15, cookMinutes: 35 }),
  recipe({ id: 26, slug: 'best-greek-salad', title: 'Best Greek Salad', description: 'Classic Greek salad (~20 min).', mealLists: ['saved'], tags: ['greek', 'salad'], prepMinutes: 20, cookMinutes: 0 }),
  recipe({ id: 27, slug: 'chicken-veggie-stir-fry', title: 'Chicken and Veggie Stir Fry', description: 'Quick chicken stir fry with mixed vegetables.', mealLists: ['saved'], tags: ['asian', 'chicken', 'stir-fry'] }),
  recipe({ id: 28, slug: 'low-carb-chicken-enchilada-casserole', title: 'Low Carb Chicken Enchilada Casserole', description: 'Low-carb enchilada-style chicken casserole.', mealLists: ['saved'], tags: ['low-carb', 'chicken', 'mexican'], sourceUrl: 'https://730sagestreet.com/low-carb-chicken-enchilada-casserole/' }),
  recipe({ id: 29, slug: 'keto-chicken-gyros', title: 'Keto Chicken Gyros', description: 'Low-carb chicken gyros.', mealLists: ['saved'], tags: ['keto', 'greek', 'chicken'], sourceUrl: 'https://headbangerskitchen.com/keto-gyros-chicken-gyros/' }),
  recipe({ id: 30, slug: 'keto-fried-tilapia-lemon-garlic-butter', title: 'Keto Fried Tilapia with Lemon Garlic Butter', description: 'Gluten-free fried tilapia with lemon garlic butter.', mealLists: ['saved'], tags: ['keto', 'fish', 'low-carb'], sourceUrl: 'https://ketopots.com/keto-tilapia/', notes: 'Original bookmark: ketofy.me (redirects); enriched from ketopots.com equivalent.' }),
  recipe({ id: 31, slug: 'greek-chicken-slow-cooker', title: 'Greek Chicken (Slow Cooker)', description: 'Greek-seasoned slow cooker chicken.', mealLists: ['saved'], tags: ['greek', 'chicken', 'slow-cooker'], sourceUrl: 'https://www.daringgourmet.com/slow-cooker-greek-chicken/' }),
  recipe({ id: 32, slug: 'vegetarian-bibimbap-tofu', title: 'Vegetarian Bibimbap with Tofu', description: 'Easy Korean bibimbap with tofu.', mealLists: ['saved'], tags: ['korean', 'vegetarian'] }),
  recipe({ id: 33, slug: 'tom-kha-gai', title: 'Tom Kha Gai (Chicken Coconut Soup)', description: 'Thai chicken coconut soup with galangal and lime.', mealLists: ['saved'], tags: ['thai', 'soup', 'chicken'] }),
  recipe({ id: 34, slug: 'authentic-greek-green-beans-fasolakia', title: 'Authentic Greek Green Beans (Fasolakia Lathera)', description: 'Greek green beans braised in tomato and olive oil.', mealLists: ['saved'], tags: ['greek', 'vegetarian', 'beans'] }),
];

const catalog = { recipes };
const json = JSON.stringify(catalog, null, 2) + '\n';

const dataPath = join(root, 'src/static-api/data/recipes.json');
const publicDir = join(root, 'public/data');
mkdirSync(dirname(dataPath), { recursive: true });
mkdirSync(publicDir, { recursive: true });
writeFileSync(dataPath, json);
writeFileSync(join(publicDir, 'recipes.json'), json);

console.log(`Wrote ${recipes.length} recipes to ${dataPath}`);
