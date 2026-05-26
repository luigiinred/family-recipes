import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout/AppLayout';
import { TagFilterRedirect } from '@/features/search/TagFilterRedirect';
import { HomePage } from '@/pages/HomePage/HomePage';
import { StarredPage } from '@/pages/StarredPage/StarredPage';
import { RecipeDetailPage } from '@/pages/RecipeDetailPage/RecipeDetailPage';
import { SettingsPage } from '@/pages/SettingsPage/SettingsPage';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<HomePage />} />
          <Route path="recipes/:slug" element={<RecipeDetailPage />} />
          <Route path="tags" element={<Navigate to="/" replace />} />
          <Route path="tags/:tag" element={<TagFilterRedirect />} />
          <Route path="starred" element={<StarredPage />} />
          <Route path="planner" element={<Navigate to="/starred" replace />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
