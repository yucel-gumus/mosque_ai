import type { Coordinates, Polygon, DistrictBoundary } from '../types/mosque.types';

const isPointInPolygon = (point: Coordinates, polygon: Polygon): boolean => {
    const [x, y] = point;
    let inside = false;
    const n = polygon.length;

    for (let i = 0, j = n - 1; i < n; j = i++) {
        const [xi, yi] = polygon[i];
        const [xj, yj] = polygon[j];

        const intersect = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;

        if (intersect) {
            inside = !inside;
        }
    }

    return inside;
};

export const findDistrictByCoordinates = (
    lat: number,
    lon: number,
    boundaries: DistrictBoundary[]
): string | undefined => {
    const point: Coordinates = [lat, lon];

    for (const boundary of boundaries) {
        if (isPointInPolygon(point, boundary.polygon)) {
            return boundary.name;
        }
    }

    return undefined;
};
