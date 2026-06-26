# İstanbul Camileri Haritası (mosque_ai)

OpenStreetMap tabanlı **3000+ İstanbul camisi** verisini Leaflet haritasında gösteren, kullanıcı konumuna göre sıralayan Vite + React 19 uygulaması.

**GitHub:** [yucel-gumus/mosque_ai](https://github.com/yucel-gumus/mosque_ai)

---

## Özellikler

- Statik `mosques.json` — API gecikmesi yok, anında yükleme
- **Marker clustering** (`react-leaflet-cluster`) — yoğun bölgelerde performans
- Geolocation ile **en yakın camiler** listesi (`react-virtuoso` sanal liste)
- Cami detayı: adres, ilçe, mahalle, OSM/Wikidata linkleri
- **Tailwind CSS 4** + **shadcn/ui** (Radix) bileşenleri
- Mobil uyumlu layout, hata sınırı (`ErrorBoundary`)

---

## Teknoloji

| Katman | Kütüphane |
|--------|-----------|
| Build | Vite 7, TypeScript |
| UI | React 19, shadcn/ui, Lucide |
| Harita | Leaflet, react-leaflet 5 |
| Veri | OSM / Overpass ile üretilmiş JSON |

---

## Kurulum

```bash
git clone https://github.com/yucel-gumus/mosque_ai.git
cd mosque_ai
npm install
npm run dev
```

`http://localhost:5173`

```bash
npm run build   # dist/
npm run preview
```

---

## Klasör yapısı

```
src/
├── data/mosques.json      # Toplu cami verisi
├── features/mosques/      # Harita, liste, hook'lar
├── shared/                # Layout, ErrorBoundary
└── components/ui/         # shadcn primitives
```

---

## Veri güncelleme

Yeni OSM export alındığında `src/data/mosques.json` güncellenir; tip tanımları `features/mosques/types` ile uyumlu kalmalıdır.

---

## Lisans

MIT. Harita verisi © [OpenStreetMap](https://www.openstreetmap.org/copyright) katkıda bulunanları.