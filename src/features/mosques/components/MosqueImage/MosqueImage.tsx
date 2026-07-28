import { useState, memo } from 'react';
import type { Mosque } from '../../types/mosque.types';
import { useMosqueImage } from '../../hooks/useMosqueImage';
import { Badge } from '@/components/ui/badge';
import { Building2, Sparkles } from 'lucide-react';

import { cn } from '@/lib/utils';

interface MosqueImageProps {
    mosque: Mosque;
    className?: string;
    compact?: boolean;
}

export const MosqueImage = memo(function MosqueImage({
    mosque,
    className,
    compact = false,
}: MosqueImageProps) {
    const { imageUrl, source, isLoading } = useMosqueImage(mosque);
    const [hasError, setHasError] = useState(false);

    const showFallback = !imageUrl || hasError;

    if (isLoading) {
        return (
            <div
                className={cn(
                    'relative w-full overflow-hidden bg-gradient-to-r from-[#FFB6A6]/20 via-[#9BCEC1]/30 to-[#FFB6A6]/20 animate-pulse rounded-2xl flex items-center justify-center',
                    compact ? 'h-24' : 'h-36 sm:h-44',
                    className
                )}
            >
                <Building2 className="h-6 w-6 text-[#4A2B20]/40 animate-bounce" />
            </div>
        );
    }

    if (showFallback) {
        return (
            <div
                className={cn(
                    'relative w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#1A4036] via-[#2A5C4E] to-[#4A2B20] p-3 text-white shadow-inner flex flex-col justify-between',
                    compact ? 'h-24' : 'h-36 sm:h-44',
                    className
                )}
            >
                {/* İznık Çini Motif Arka Plan Desen Efekti */}
                <div className="absolute inset-0 opacity-15 pointer-events-none bg-[radial-gradient(#9BCEC1_1px,transparent_1px)] [background-size:12px_12px]" />

                <div className="relative z-10 flex items-center justify-between">
                    <Badge className="bg-[#9BCEC1]/30 text-[#E2F4EE] backdrop-blur-md text-[9px] font-bold border border-[#9BCEC1]/40 flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5 text-[#9BCEC1]" />
                        Cami Görseli
                    </Badge>
                </div>

                <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto">
                    <div className="h-8 w-8 rounded-full bg-[#9BCEC1]/20 backdrop-blur-md flex items-center justify-center mb-1 border border-[#9BCEC1]/30">
                        <Building2 className="h-4 w-4 text-[#9BCEC1]" />
                    </div>
                    <p className="text-xs font-bold tracking-wide text-[#FFF6EC] line-clamp-1">
                        {mosque.name}
                    </p>
                    <p className="text-[10px] text-[#9BCEC1]/80 font-medium truncate max-w-[90%]">
                        {mosque.district || 'İstanbul'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div
            className={cn(
                'relative w-full overflow-hidden rounded-2xl bg-muted shadow-sm group',
                compact ? 'h-24' : 'h-36 sm:h-44',
                className
            )}
        >
            <img
                src={imageUrl!}
                alt={`${mosque.name} Görseli`}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                onError={() => setHasError(true)}
                loading="lazy"
            />

            {source && source !== 'Pattern' && (
                <Badge
                    className={cn(
                        'absolute bottom-2 right-2 bg-black/60 text-white backdrop-blur-md font-extrabold shadow-md border border-white/20',
                        compact ? 'text-[8px] px-1.5 py-0' : 'text-[9px] px-2 py-0.5'
                    )}
                >
                    {source === 'Google Places' && '📍 Google Places'}
                    {source === 'Wikipedia' && '📚 Wikipedia'}
                    {source === 'Google Street View' && '📷 Google Street View'}
                    {source === 'Custom' && '🖼️ Özel Fotoğraf'}
                </Badge>
            )}
        </div>
    );
});
