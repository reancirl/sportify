export type * from './auth';
export type * from './navigation';
export type * from './ui';

// Backend API contract types — exported under a namespace to avoid clashing
// with the shared-auth `User` shape exported from ./auth. Import via:
//   `import { Models } from '@/types';`  →  `Models.Booking`, `Models.Venue`, ...
// or import directly from `@/types/models` for short names.
export type * as Models from './models';
