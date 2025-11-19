import { PageLayout } from './pages/PageLayout';
import { Routes } from './pages/Routes';
import TestPathfinding from './test-pathfinding';

function App() {
  // URL 쿼리 파라미터로 페이지 선택
  // ?test=pathfinding → 경로 계산 검증 페이지
  // ?test=api → API 테스트 페이지 (기본값)
  const params = new URLSearchParams(window.location.search);
  const testMode = params.get('test');

  if (testMode === 'pathfinding') {
    return <TestPathfinding />;
  }

  return (
    <PageLayout>
      <Routes />
    </PageLayout>
  );
}

export default App;
