import { useCallback, useRef } from 'react';

export function useCompass(onHeading: (heading: number) => void) {
  const handlerRef = useRef<((e: DeviceOrientationEvent) => void) | null>(null);

  const start = useCallback(() => {
    if (!window.DeviceOrientationEvent) return false;
    const handler = (e: DeviceOrientationEvent) => {
      let h: number | null = null;
      if ((e as any).webkitCompassHeading !== undefined) h = (e as any).webkitCompassHeading;
      else if (e.alpha !== null) h = 360 - e.alpha;
      if (h !== null) onHeading(((h % 360) + 360) % 360);
    };
    handlerRef.current = handler;
    window.addEventListener('deviceorientation', handler);
    return true;
  }, [onHeading]);

  const stop = useCallback(() => {
    if (handlerRef.current) {
      window.removeEventListener('deviceorientation', handlerRef.current);
    }
  }, []);

  return { start, stop };
}
