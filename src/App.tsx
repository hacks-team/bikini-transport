import { OverlayProvider } from 'overlay-kit';
import { PageLayout } from './pages/PageLayout';
import { Routes } from './pages/Routes';
import { ToastProvider } from './ui-lib/components/Toast';

function App() {
  return (
    <OverlayProvider>
      <ToastProvider>
        <PageLayout>
          <Routes />
        </PageLayout>
      </ToastProvider>
    </OverlayProvider>
  );
}

export default App;
