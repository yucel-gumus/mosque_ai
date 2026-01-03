import type { Mosque } from '../../types/mosque.types';
import { formatCoordinates } from '../../utils/geo.utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
    Building2,
    MapPin,
    ExternalLink,
    User,
    Globe,
    Users,
    Accessibility,
    Image as ImageIcon,
    BookOpen,
} from 'lucide-react';

interface MosqueDetailsProps {
    mosque: Mosque;
}

const wheelchairLabels: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
    yes: { label: 'Erişilebilir', variant: 'default' },
    limited: { label: 'Kısıtlı Erişim', variant: 'secondary' },
    no: { label: 'Erişilemez', variant: 'destructive' },
};

export function MosqueDetails({
    mosque,
}: MosqueDetailsProps) {
    const wheelchairInfo = mosque.wheelchair ? wheelchairLabels[mosque.wheelchair] : null;

    return (
        <Card>
            <CardHeader className="pb-2 sm:pb-3">
                <CardTitle className="flex items-center gap-1.5 text-base sm:gap-2 sm:text-lg">
                    <Building2 className="h-4 w-4 text-primary sm:h-5 sm:w-5" />
                    {mosque.name}
                </CardTitle>
                <p className="flex items-center gap-1 text-[10px] text-muted-foreground sm:text-xs">
                    <MapPin className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                    {formatCoordinates(mosque.lat, mosque.lon, 5)}
                </p>
            </CardHeader>

            <Separator />

            <CardContent className="pt-3 sm:pt-4">
                <dl className="space-y-1.5 text-xs sm:space-y-2 sm:text-sm">
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

                    {mosque.architect && (
                        <div className="flex justify-between">
                            <dt className="flex items-center gap-1 text-muted-foreground">
                                <User className="h-3 w-3" />
                                Mimar
                            </dt>
                            <dd className="font-medium">{mosque.architect}</dd>
                        </div>
                    )}

                    {mosque.capacity && (
                        <div className="flex justify-between">
                            <dt className="flex items-center gap-1 text-muted-foreground">
                                <Users className="h-3 w-3" />
                                Kapasite
                            </dt>
                            <dd className="font-medium">{mosque.capacity} kişi</dd>
                        </div>
                    )}

                    {wheelchairInfo && (
                        <div className="flex justify-between items-center">
                            <dt className="flex items-center gap-1 text-muted-foreground">
                                <Accessibility className="h-3 w-3" />
                                Engelli Erişimi
                            </dt>
                            <dd>
                                <Badge variant={wheelchairInfo.variant} className="text-[10px] px-1.5 py-0">
                                    {wheelchairInfo.label}
                                </Badge>
                            </dd>
                        </div>
                    )}

                    {mosque.website && (
                        <div className="flex justify-between">
                            <dt className="flex items-center gap-1 text-muted-foreground">
                                <Globe className="h-3 w-3" />
                                Website
                            </dt>
                            <dd>
                                <a
                                    href={mosque.website}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                    Ziyaret Et
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </dd>
                        </div>
                    )}

                    {mosque.image && (
                        <div className="flex justify-between">
                            <dt className="flex items-center gap-1 text-muted-foreground">
                                <ImageIcon className="h-3 w-3" />
                                Fotoğraf
                            </dt>
                            <dd>
                                <a
                                    href={mosque.image}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                    Görüntüle
                                    <ExternalLink className="h-3 w-3" />
                                </a>
                            </dd>
                        </div>
                    )}

                    <Separator className="my-2" />

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

                    {mosque.wikipedia && (
                        <div className="flex justify-between">
                            <dt className="flex items-center gap-1 text-muted-foreground">
                                <BookOpen className="h-3 w-3" />
                                Wikipedia
                            </dt>
                            <dd>
                                <a
                                    href={`https://tr.wikipedia.org/wiki/${mosque.wikipedia.replace(/^tr:/, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-1 text-primary hover:underline"
                                >
                                    Makale
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
