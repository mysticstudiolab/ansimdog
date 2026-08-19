import catMeal from '../assets/icons/cat-meal.png';
import catWalk from '../assets/icons/cat-walk.png';
import catPoop from '../assets/icons/cat-poop.png';
import catMood from '../assets/icons/cat-mood.png';
import catMed from '../assets/icons/cat-med.png';

export type Category = 'meal' | 'walk' | 'poop' | 'mood' | 'med';

const CATEGORY_ICON_SRC: Record<Category, string> = {
  meal: catMeal,
  walk: catWalk,
  poop: catPoop,
  mood: catMood,
  med: catMed,
};

export function CategoryIcon({ category, size = 20 }: { category: Category; size?: number }) {
  return (
    <img
      src={CATEGORY_ICON_SRC[category]}
      alt=""
      style={{ width: size, height: size, objectFit: 'contain', display: 'block' }}
    />
  );
}
