import { useEffect, useState } from 'react';
import { getOrCreateDeviceId } from '@/lib/deviceId';

/** 仅客户端可用；首帧为空，挂载后写入 */
export function useDeviceId(): string {
  const [id, setId] = useState('');
  useEffect(() => {
    setId(getOrCreateDeviceId());
  }, []);
  return id;
}
