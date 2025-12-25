import { useEffect } from 'react';
import { AppShell, Header } from './shared/components/Layout';
import { MosquesFeature } from './features/mosques';
import { setupLeafletIcons } from './features/mosques/utils/leaflet.utils';

// Styles
import 'leaflet/dist/leaflet.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';

/**
 * Ana uygulama komponenti.
 *
 * @description
 * Minimal root component. Layout ve feature'ları compose eder.
 * Leaflet ikon ayarlarını uygulama başlangıcında yapar.
 */
function App() {
  // Leaflet ikonlarını bir kez ayarla
  useEffect(() => {
    setupLeafletIcons();
  }, []);

  return (
    <AppShell>
      <Header
        eyebrow="İstanbul Camileri"
        title="Şehrin tamamındaki ibadethaneler tek haritada"
        lead="Overpass API ile OpenStreetMap verisi canlı olarak çekiliyor. Binlerce cami özel pinlerle kümeleniyor, dilerseniz tek bir ilçe seçerek haritayı ve listeyi daraltabilirsiniz."
      />

      <MosquesFeature />
    </AppShell>
  );
}

export default App;
