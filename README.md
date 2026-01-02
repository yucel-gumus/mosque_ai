# 🕌 İstanbul Camileri Haritası

İstanbul genelindeki 3000'den fazla camiyi harita üzerinde görüntüleyen, konum bazlı sıralama yapan ve detaylı bilgiler sunan modern bir web uygulamasıdır.

## 🚀 Özellikler

- **Geniş Veri Tabanı:** OpenStreetMap verileriyle oluşturulmuş, İstanbul'daki tüm camileri kapsayan statik veri seti.
- **İnteraktif Harita:** Leaflet.js tabanlı, kümeleme (clustering) özellikli performanslı harita.
- **Konum Bazlı Sıralama:** Kullanıcı konumuna göre en yakın camileri otomatik listeleme.
- **Detaylı Bilgiler:** Her cami için adres, ilçe, mahalle ve WikiData/OSM bağlantıları.
- **Modern Arayüz:** Tailwind CSS ve shadcn/ui ile tasarlanmış, mobil uyumlu ve şık tasarım.
- **Performans:** Statik JSON verisi kullanımı sayesinde API bağımlılığı olmadan anlık yükleme.

## 🛠 Teknolojiler

- **Core:** [React](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
- **UI & Styling:** [Tailwind CSS](https://tailwindcss.com/), [shadcn/ui](https://ui.shadcn.com/), [Lucide React](https://lucide.dev/)
- **Harita:** [React Leaflet](https://react-leaflet.js.org/), [Leaflet](https://leafletjs.com/)
- **Veri:** OpenStreetMap (Overpass API ile çekilmiş statik JSON)

## 📦 Kurulum

Projeyi yerel ortamınızda çalıştırmak için:

1.  **Repoyu klonlayın:**
    ```bash
    git clone https://github.com/kullaniciadi/istanbul-camileri.git
    cd istanbul-camileri
    ```

2.  **Bağımlılıkları yükleyin:**
    ```bash
    npm install
    ```

3.  **Geliştirme sunucusunu başlatın:**
    ```bash
    npm run dev
    ```

4.  Tarayıcınızda `http://localhost:5173` adresine gidin.

## 🏗 Mimari

Proje, "Feature-Based" (Özellik Tabanlı) klasör yapısını kullanır:

- `src/data`: Statik cami verilerini içerir (`mosques.json`).
- `src/features/mosques`: Cami listeleme ve harita özellikleri buradadır.
  - `components`: UI bileşenleri (Harita, Liste, Detay).
  - `hooks`: Logic (Konum, Sıralama).
  - `types`: TypeScript tip tanımları.
- `src/shared`: Paylaşılan bileşenler (Layout, ErrorBoundary).
- `src/components/ui`: shadcn/ui taban bileşenleri.

## 📝 Lisans

Bu proje MIT lisansı ile lisanslanmıştır. Veriler [OpenStreetMap](https://www.openstreetmap.org/copyright) katkıda bulunanları tarafından sağlanmıştır.
