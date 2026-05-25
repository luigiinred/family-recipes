import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout/AppLayout';
import { HomePage } from '@/pages/HomePage/HomePage';
import { PlannerPage } from '@/pages/PlannerPage/PlannerPage';
import { RecipeDetailPage } from '@/pages/RecipeDetailPage/RecipeDetailPage';
import { TagsPage } from '@/pages/TagsPage/TagsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="recipes/:slug" element={<RecipeDetailPage />} />
          <Route path="tags" element={<TagsPage />} />
          <Route path="tags/:tag" element={<TagsPage />} />
          <Route path="planner" element={<PlannerPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
