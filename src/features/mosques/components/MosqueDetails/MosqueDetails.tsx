import type { Mosque } from '../../types/mosque.types';
import { formatCoordinates } from '../../utils/geo.utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Building2, MapPin, ExternalLink } from 'lucide-react';

interface MosqueDetailsProps {
    mosque: Mosque;
}

export function MosqueDetails({
    mosque,
}: MosqueDetailsProps) {
    return (
        <Card>
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                    <Building2 className="h-5 w-5 text-primary" />
                    {mosque.name}
                </CardTitle>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                    <MapPin className="h-3 w-3" />
                    {formatCoordinates(mosque.lat, mosque.lon, 5)}
                </p>
            </CardHeader>

            <Separator />

            <CardContent className="pt-4">
                <dl className="space-y-2 text-sm">
                    {mosque.district && (
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">İlçe</dt>
                            <dd className="font-medium">{mosque.district}</dd>
                        </div>
                    )}

                    {mosque.neighborhood && (
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Mahalle</dt>
                            <dd className="font-medium">{mosque.neighborhood}</dd>
                        </div>
                    )}

                    <div className="flex justify-between">
                        <dt className="text-muted-foreground">OSM</dt>
                        <dd>
                            <a
                                href={mosque.osmUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-primary hover:underline"
                            >
                                #{mosque.id}
                                <ExternalLink className="h-3 w-3" />
                            </a>
                        </dd>
                    </div>

                    {mosque.wikidata && (
                        <div className="flex justify-between">
                            <dt className="text-muted-foreground">Wikidata</dt>
                            <dd>
                                <a
                                    href={`https://www.wikidata.org/wiki/${mosque.wikidata}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                    {mosque.wikidata}
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </dd>
                        </div>
                    )}
                </dl>
            </CardContent>
        </Card>
    );
}
