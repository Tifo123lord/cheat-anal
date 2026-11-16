'use client';

import { useEffect } from 'react';
import { rehydrateAll } from '@/store/hydration';

export default function StoreHydrator() {
  useEffect(() => {
    void rehydrateAll();
  }, []);
  return null;
}
