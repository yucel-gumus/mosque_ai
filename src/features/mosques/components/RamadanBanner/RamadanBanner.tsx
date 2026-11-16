import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Moon, Sparkles, Clock, SunMedium } from 'lucide-react';
import { getRamadanCountdown, type RamadanCountdown } from '../../utils/ramadan.utils';

interface RamadanBannerProps {
    fajrTime?: string;
    maghribTime?: string;
}

export function RamadanBanner({ fajrTime = '05:32', maghribTime = '20:18' }: RamadanBannerProps) {
    const [countdown, setCountdown] = useState<RamadanCountdown>(() =>
        getRamadanCountdown(fajrTime, maghribTime)
    );

    useEffect(() => {
        const interval = setInterval(() => {
            setCountdown(getRamadanCountdown(fajrTime, maghribTime));
        }, 1000);
        return () => clearInterval(interval);
    }, [fajrTime, maghribTime]);

    const isIftar = countdown.targetEvent === 'İftar';

    return (
        <Card className="rounded-3xl border-2 border-[#BCC7D2] bg-gradient-to-r from-[#253341] via-[#3E5164] to-[#253341] text-[#F5F9F5] shadow-xl overflow-hidden relative transition-all duration-300">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
                <Moon className="w-32 h-32 text-[#F5F9F5]" />
            </div>

            <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row items-center justify-between gap-4 z-10 relative">
                {/* Left: Ramadan Title & Info */}
                <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#F2A488] text-[#253341] shadow-md shrink-0">
                        <Moon className="h-6 w-6 text-[#253341] fill-[#253341]" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm sm:text-base font-extrabold tracking-wide text-[#F5F9F5] flex items-center gap-1.5">
                                Ramazan-ı Şerif Özel Paneli
                                <Sparkles className="h-4 w-4 text-[#F2A488]" />
                            </h3>
                        </div>
                        <p className="text-xs text-[#DCE3EA] font-semibold mt-0.5">
                            İmsak (Sahur): <span className="font-bold text-[#F5F9F5]">{fajrTime}</span> • Akşam (İftar): <span className="font-bold text-[#F5F9F5]">{maghribTime}</span>
                        </p>
                    </div>
                </div>

                {/* Right: Live Countdown Widget */}
                <div className="flex items-center gap-3 bg-[#253341]/70 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-[#BCC7D2]/30">
                    <div className="flex items-center gap-2">
                        {isIftar ? (
                            <SunMedium className="h-5 w-5 text-[#F2A488]" />
                        ) : (
                            <Clock className="h-5 w-5 text-[#EC7D55]" />
                        )}
                        <span className="text-xs font-bold text-[#EDF3EE]">
                            {countdown.targetEvent}'e Kalan:
                        </span>
                    </div>

                    <div className="font-mono text-base sm:text-lg font-black tracking-widest text-[#253341] bg-[#EC7D55] px-3 py-1 rounded-xl border border-[#F2A488] shadow-inner">
                        {countdown.formattedTime}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
