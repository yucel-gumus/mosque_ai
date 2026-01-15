import { Profiler, type ProfilerOnRenderCallback } from 'react';

interface PerformanceProfilerProps {
    id: string;
    children: React.ReactNode;
}

export function PerformanceProfiler({ id, children }: PerformanceProfilerProps) {
    const onRenderCallback: ProfilerOnRenderCallback = (
        _id,
        phase,
        actualDuration,
        baseDuration,
        _startTime,
        commitTime
    ) => {
        if (actualDuration > 100) {
            console.warn(`Slow render detected for ${_id}:`, {
                phase,
                actualDuration: actualDuration.toFixed(2) + 'ms',
                baseDuration: baseDuration.toFixed(2) + 'ms',
                timestamp: new Date(commitTime).toISOString(),
            });
        }
    };

    return (
        <Profiler id={id} onRender={onRenderCallback}>
            {children}
        </Profiler>
    );
}
