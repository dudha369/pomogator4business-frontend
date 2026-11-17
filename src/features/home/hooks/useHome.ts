import { useQuery } from '@tanstack/react-query';

import { fetchHome } from '@/features/home/api';
import { queryKeys } from '@/shared/api/queryKeys';

export const useHome = () =>
  useQuery({ queryKey: queryKeys.home, queryFn: fetchHome });
