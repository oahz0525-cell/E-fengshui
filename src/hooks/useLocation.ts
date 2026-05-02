import { useCallback, useRef } from 'react';
import type { Location } from '@/types';

export function useLocation(
  onLocated: (loc: Location) => void,
  onFailed?: () => void
) {
  const resolvedRef = useRef(false);

  const resolve = useCallback((lat: number, lng: number) => {
    if (resolvedRef.current) return;
    resolvedRef.current = true;
    onLocated({ lat, lng });
  }, [onLocated]);

  const startLocate = useCallback(() => {
    resolvedRef.current = false;
    // 5s timeout fallback
    setTimeout(() => {
      if (!resolvedRef.current) {
        onFailed?.();
        resolve(39.9042, 116.4074);
      }
    }, 5000);

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => resolve(pos.coords.latitude, pos.coords.longitude),
        () => {
          onFailed?.();
          resolve(39.9042, 116.4074);
        },
        { timeout: 8000, maximumAge: 60000 }
      );
    } else {
      onFailed?.();
      resolve(39.9042, 116.4074);
    }
  }, [resolve, onFailed]);

  return { startLocate };
}
