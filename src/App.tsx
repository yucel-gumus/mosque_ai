import { useEffect } from 'react';
import { AppShell, Header } from './shared/components/Layout';
import { ErrorBoundary } from './shared/components/ErrorBoundary';
import { MosquesFeature } from './features/mosques';
import { setupLeafletIcons } from './features/mosques/utils/leaflet.utils';

import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

function App() {
  useEffect(() => {
    setupLeafletIcons();
  }, []);

  return (
    <ErrorBoundary>
      <AppShell>
        <Header eyebrow="İstanbul Camileri" />
        <MosquesFeature />
      </AppShell>
    </ErrorBoundary>
  );
}

export default App;

