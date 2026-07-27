import { AppShell } from './shared/components/Layout';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { MosquesFeature } from './features/mosques';

function App() {
  return (
    <ErrorBoundary>
      <AppShell>
        <MosquesFeature />
      </AppShell>
    </ErrorBoundary>
  );
}

export default App;
