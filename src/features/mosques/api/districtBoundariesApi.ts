import type { DistrictBoundary, Coordinates } from '../types/mosque.types';

interface IstanbulDistrict {
    name: string;
    center: Coordinates;
    radius: number;
}

const ISTANBUL_DISTRICTS: IstanbulDistrict[] = [
    { name: 'Adalar', center: [40.876, 29.126], radius: 0.08 },
    { name: 'Arnavutköy', center: [41.185, 28.740], radius: 0.12 },
    { name: 'Ataşehir', center: [40.983, 29.127], radius: 0.06 },
    { name: 'Avcılar', center: [40.980, 28.722], radius: 0.07 },
    { name: 'Bağcılar', center: [41.039, 28.856], radius: 0.05 },
    { name: 'Bahçelievler', center: [41.002, 28.859], radius: 0.04 },
    { name: 'Bakırköy', center: [40.980, 28.872], radius: 0.05 },
    { name: 'Başakşehir', center: [41.093, 28.802], radius: 0.08 },
    { name: 'Bayrampaşa', center: [41.047, 28.912], radius: 0.03 },
    { name: 'Beşiktaş', center: [41.043, 29.009], radius: 0.04 },
    { name: 'Beykoz', center: [41.127, 29.100], radius: 0.12 },
    { name: 'Beylikdüzü', center: [41.002, 28.642], radius: 0.06 },
    { name: 'Beyoğlu', center: [41.037, 28.977], radius: 0.03 },
    { name: 'Büyükçekmece', center: [41.020, 28.585], radius: 0.10 },
    { name: 'Çatalca', center: [41.143, 28.460], radius: 0.20 },
    { name: 'Çekmeköy', center: [41.033, 29.188], radius: 0.07 },
    { name: 'Esenler', center: [41.043, 28.876], radius: 0.03 },
    { name: 'Esenyurt', center: [41.033, 28.673], radius: 0.07 },
    { name: 'Eyüpsultan', center: [41.085, 28.930], radius: 0.08 },
    { name: 'Fatih', center: [41.019, 28.940], radius: 0.04 },
    { name: 'Gaziosmanpaşa', center: [41.063, 28.912], radius: 0.04 },
    { name: 'Güngören', center: [41.020, 28.876], radius: 0.03 },
    { name: 'Kadıköy', center: [40.990, 29.034], radius: 0.05 },
    { name: 'Kağıthane', center: [41.080, 28.973], radius: 0.04 },
    { name: 'Kartal', center: [40.906, 29.188], radius: 0.06 },
    { name: 'Küçükçekmece', center: [41.000, 28.780], radius: 0.06 },
    { name: 'Maltepe', center: [40.935, 29.130], radius: 0.06 },
    { name: 'Pendik', center: [40.880, 29.250], radius: 0.10 },
    { name: 'Sancaktepe', center: [41.000, 29.230], radius: 0.06 },
    { name: 'Sarıyer', center: [41.167, 29.050], radius: 0.10 },
    { name: 'Silivri', center: [41.073, 28.246], radius: 0.15 },
    { name: 'Sultanbeyli', center: [40.963, 29.262], radius: 0.04 },
    { name: 'Sultangazi', center: [41.107, 28.867], radius: 0.05 },
    { name: 'Şile', center: [41.176, 29.613], radius: 0.20 },
    { name: 'Şişli', center: [41.060, 28.987], radius: 0.04 },
    { name: 'Tuzla', center: [40.820, 29.300], radius: 0.08 },
    { name: 'Ümraniye', center: [41.020, 29.120], radius: 0.06 },
    { name: 'Üsküdar', center: [41.023, 29.015], radius: 0.06 },
    { name: 'Zeytinburnu', center: [41.003, 28.903], radius: 0.03 },
];

const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const dLat = lat2 - lat1;
    const dLon = lon2 - lon1;
    return Math.sqrt(dLat * dLat + dLon * dLon);
};

export const findDistrictByProximity = (lat: number, lon: number): string | undefined => {
    let closestDistrict: string | undefined;
    let minDistance = Infinity;

    for (const district of ISTANBUL_DISTRICTS) {
        const distance = calculateDistance(lat, lon, district.center[0], district.center[1]);

        if (distance <= district.radius && distance < minDistance) {
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

export async function fetchDistrictBoundaries(): Promise<DistrictBoundary[]> {
    return [];
}
