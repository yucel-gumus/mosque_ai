# 🕌 İstanbul Camileri Haritası (High-Performance GIS Mosque Map)

İstanbul Camileri Haritası; İstanbul genelinde bulunan **3000'den fazla** caminin konum bilgilerini OpenStreetMap (OSM) tabanlı bir Leaflet haritası üzerinde gösteren, kullanıcının GPS konumuna göre en yakın camileri gerçek zamanlı listeleyen ve filtreleyen **React 19 & Vite 7** tabanlı yüksek performanslı bir coğrafi bilgi sistemi (CBS) uygulamasıdır.

---

## 🌟 Öne Çıkan Özellikler

* 🗺️ **3000+ Cami Konumu Veri Seti:** Overpass API (OpenStreetMap) kullanılarak İstanbul genelindeki tüm camilerin adları, ilçeleri, mahalleleri, koordinatları ve varsa Wikidata/Wikipedia bağlantıları toplanmış ve yerel sıkıştırılmış bir JSON veri seti haline getirilmiştir. Bu sayede hiçbir ağ gecikmesi olmadan anında yüklenir.
* 📍 **Gelişmiş Marker Clustering (`react-leaflet-cluster`):** Haritada binlerce işaretçinin (markers) aynı anda render edilmesi durumunda yaşanacak performans düşüşlerini engellemek için, yakın konumdaki işaretçiler dinamik olarak kümelenir.
* 📱 **Konum Tabanlı Sıralama & Geolocation:** Tarayıcının yerleşik **Geolocation API**'si üzerinden kullanıcının anlık konumu alınır. İllere olan mesafeler haversine formülü kullanılarak milisaniyeler seviyesinde hesaplanır ve en yakın camiler yakından uzağa doğru listelenir.
* ⚡ **DOM Sanallaştırma (`react-virtuoso`):** Yan paneldeki 3000+ elemanlı devasa listeyi performans kaybı olmadan kaydırabilmek için `react-virtuoso` kullanılmıştır. Sadece kullanıcının ekranda gördüğü liste elemanları DOM üzerinde oluşturulur.
* 🎨 **Modern Arayüz & Erişilebilirlik:** TailwindCSS v4 ve Radix UI Select/Separator/Slider bileşenleri kullanılarak tamamen responsive, mobil öncelikli ve karanlık mod uyumlu bir arayüz tasarlanmıştır.

---

## 🏗️ Veri Akışı ve CBS Mimarisi

```
[ Kullanıcı İzin Verir ] ──► [ Geolocation API ] ──► [ Enlem, Boylam ]
                                                           │
                                                   (Mesafe Hesaplama)
                                                           ▼
[ mosques.json (3000+) ] ──► [ Haversine Sıralama ] ──► [ React-Virtuoso (Sanal Liste) ]
      │
      ▼
[ React-Leaflet Cluster ] ──► [ Dynamic Clustering ] ──► [ 60 FPS Pürüzsüz Harita ]
```

---

## 🛠️ Teknoloji Stack

* **Frontend Framework:** React 19, Vite 7, TypeScript.
* **Harita & CBS:** Leaflet 1.9, react-leaflet 5, react-leaflet-cluster.
* **Arayüz & Stiller:** TailwindCSS v4, Radix UI Primitives, Lucide Icons.
* **Performans Optimizasyonu:** react-virtuoso (sanal kaydırma listesi).
* **Veri:** OpenStreetMap (OSM) Overpass API.

---

## 📂 Proje Klasör Yapısı

```
mosque_ai/
├── src/
│   ├── data/
│   │   └── mosques.json        # 3000+ caminin koordinat ve adres bilgilerini içeren ana CBS veri seti
│   ├── features/
│   │   └── mosques/
│   │       ├── components/    # MosqueMap, MosqueList, FilterPanel bileşenleri
│   │       ├── hooks/         # useDistanceCalculator, useGeolocation hook'ları
│   │       └── types.ts       # Cami veri modelleri ve arayüz tipleri
│   ├── shared/                # Layout, ErrorBoundary, ThemeProvider
│   ├── App.tsx                # Ana React bileşeni
│   └── main.tsx
├── public/
├── vite.config.ts            # Tailwind v4 plugin ve Vite 7 yapılandırması
└── package.json
```

---

## 🚀 Kurulum ve Yerel Çalıştırma

### 1. Bağımlılıkları Yükleyin
```bash
git clone https://github.com/yucel-gumus/mosque_ai.git
cd mosque_ai
npm install
```

### 2. Geliştirme Sunucusunu Başlatma
```bash
npm run dev
```
Uygulama `http://localhost:5173` adresinde başlayacaktır.

### 3. Statik Dağıtım Derlemesi (Build)
```bash
npm run build
```
Derleme çıktıları `dist/` klasörü altına kaydedilir. Bu klasörü Vercel, Netlify veya GitHub Pages üzerinde doğrudan host edebilirsiniz.

---

## 🔗 Bağlantılar
* **GitHub Repository:** [https://github.com/yucel-gumus/mosque_ai](https://github.com/yucel-gumus/mosque_ai)
* **Geliştirici LinkedIn:** [https://linkedin.com/in/yucel-gumus](https://linkedin.com/in/yucel-gumus)