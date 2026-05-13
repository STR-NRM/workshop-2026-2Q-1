import { lazy, Suspense } from 'react';
import { HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import Landing from './pages/Landing';
import { AppShell, Panel } from './components/common/Layout';

const Survey = lazy(() => import('./pages/Survey'));
const Complete = lazy(() => import('./pages/Complete'));
const Result = lazy(() => import('./pages/Result'));
const Comparison = lazy(() => import('./pages/Comparison'));

function LazyPage({ children }) {
  return (
    <Suspense
      fallback={
        <AppShell>
          <Panel style={{ padding: 24 }}>화면을 불러오는 중입니다.</Panel>
        </AppShell>
      }
    >
      {children}
    </Suspense>
  );
}

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/survey" element={<LazyPage><Survey /></LazyPage>} />
        <Route path="/complete" element={<LazyPage><Complete /></LazyPage>} />
        <Route
          path="/admin"
          element={
            <LazyPage>
              <Result />
            </LazyPage>
          }
        />
        <Route
          path="/comparison"
          element={
            <LazyPage>
              <Comparison />
            </LazyPage>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </HashRouter>
  );
}
