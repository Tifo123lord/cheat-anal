import { createJSONStorage } from 'zustand/middleware';

/** localStorage-backed JSON storage. Stores skip automatic hydration; <StoreHydrator/> rehydrates after mount. */
export const browserStorage = createJSONStorage(() => localStorage);
