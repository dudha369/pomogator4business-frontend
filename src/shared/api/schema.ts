import type { components } from '@/shared/api/generated/api-types';

/** Тип ответа/тела запроса из OpenAPI-схемы бэкенда (`npm run gen:types`). */
export type Schema<Name extends keyof components['schemas']> =
  components['schemas'][Name];
