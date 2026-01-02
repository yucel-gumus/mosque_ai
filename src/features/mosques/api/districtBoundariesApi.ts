import type { Coordinates } from '../types/mosque.types';
import { calculateDistance } from '../utils/geo.utils';

interface IstanbulDistrict {
    name: string;
    center: Coordinates;
    radiusMeters: number;
}

const ISTANBUL_DISTRICTS: IstanbulDistrict[] = [
    { name: 'Adalar', center: [40.876, 29.126], radiusMeters: 8000 },
    { name: 'Arnavutköy', center: [41.185, 28.740], radiusMeters: 12000 },
    { name: 'Ataşehir', center: [40.983, 29.127], radiusMeters: 6000 },
    { name: 'Avcılar', center: [40.980, 28.722], radiusMeters: 7000 },
    { name: 'Bağcılar', center: [41.039, 28.856], radiusMeters: 5000 },
    { name: 'Bahçelievler', center: [41.002, 28.859], radiusMeters: 4000 },
    { name: 'Bakırköy', center: [40.980, 28.872], radiusMeters: 5000 },
    { name: 'Başakşehir', center: [41.093, 28.802], radiusMeters: 8000 },
    { name: 'Bayrampaşa', center: [41.047, 28.912], radiusMeters: 3000 },
    { name: 'Beşiktaş', center: [41.043, 29.009], radiusMeters: 4000 },
    { name: 'Beykoz', center: [41.127, 29.100], radiusMeters: 12000 },
    { name: 'Beylikdüzü', center: [41.002, 28.642], radiusMeters: 6000 },
    { name: 'Beyoğlu', center: [41.037, 28.977], radiusMeters: 3000 },
    { name: 'Büyükçekmece', center: [41.020, 28.585], radiusMeters: 10000 },
    { name: 'Çatalca', center: [41.143, 28.460], radiusMeters: 20000 },
    { name: 'Çekmeköy', center: [41.033, 29.188], radiusMeters: 7000 },
    { name: 'Esenler', center: [41.043, 28.876], radiusMeters: 3000 },
    { name: 'Esenyurt', center: [41.033, 28.673], radiusMeters: 7000 },
    { name: 'Eyüpsultan', center: [41.085, 28.930], radiusMeters: 8000 },
    { name: 'Fatih', center: [41.019, 28.940], radiusMeters: 4000 },
    { name: 'Gaziosmanpaşa', center: [41.063, 28.912], radiusMeters: 4000 },
    { name: 'Güngören', center: [41.020, 28.876], radiusMeters: 3000 },
    { name: 'Kadıköy', center: [40.990, 29.034], radiusMeters: 5000 },
    { name: 'Kağıthane', center: [41.080, 28.973], radiusMeters: 4000 },
    { name: 'Kartal', center: [40.906, 29.188], radiusMeters: 6000 },
    { name: 'Küçükçekmece', center: [41.000, 28.780], radiusMeters: 6000 },
    { name: 'Maltepe', center: [40.935, 29.130], radiusMeters: 6000 },
    { name: 'Pendik', center: [40.880, 29.250], radiusMeters: 10000 },
    { name: 'Sancaktepe', center: [41.000, 29.230], radiusMeters: 6000 },
    { name: 'Sarıyer', center: [41.167, 29.050], radiusMeters: 10000 },
    { name: 'Silivri', center: [41.073, 28.246], radiusMeters: 15000 },
    { name: 'Sultanbeyli', center: [40.963, 29.262], radiusMeters: 4000 },
    { name: 'Sultangazi', center: [41.107, 28.867], radiusMeters: 5000 },
    { name: 'Şile', center: [41.176, 29.613], radiusMeters: 20000 },
    { name: 'Şişli', center: [41.060, 28.987], radiusMeters: 4000 },
    { name: 'Tuzla', center: [40.820, 29.300], radiusMeters: 8000 },
    { name: 'Ümraniye', center: [41.020, 29.120], radiusMeters: 6000 },
    { name: 'Üsküdar', center: [41.023, 29.015], radiusMeters: 6000 },
    { name: 'Zeytinburnu', center: [41.003, 28.903], radiusMeters: 3000 },
];

export const findDistrictByProximity = (lat: number, lon: number): string | undefined => {
    let closestDistrict: string | undefined;
    let minDistance = Infinity;

    for (const district of ISTANBUL_DISTRICTS) {
        const distance = calculateDistance(lat, lon, district.center[0], district.center[1]);

        if (distance <= district.radiusMeters && distance < minDistance) {
            minDistance = distance;
            closestDistrict = district.name;
        }
    }

    if (!closestDistrict) {
        for (const district of ISTANBUL_DISTRICTS) {
            const distance = calculateDistance(lat, lon, district.center[0], district.center[1]);
            if (distance < minDistance) {
                minDistance = distance;
                closestDistrict = district.name;
            }
        }
    }

    return closestDistrict;
};

