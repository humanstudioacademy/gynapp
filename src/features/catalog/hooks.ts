import { useQuery } from '@tanstack/react-query';

import { qk } from '@/lib/query/keys';

import { fetchCatalogCounts, fetchEquipment, fetchMuscleGroups } from './api';

export function useMuscleGroups() {
  return useQuery({
    queryKey: qk.catalog.muscleGroups(),
    queryFn: fetchMuscleGroups,
    staleTime: 1000 * 60 * 60 * 24, // catálogo muda raramente
  });
}

export function useEquipment() {
  return useQuery({
    queryKey: qk.catalog.equipment(),
    queryFn: fetchEquipment,
    staleTime: 1000 * 60 * 60 * 24,
  });
}

export function useCatalogCounts() {
  return useQuery({
    queryKey: ['catalog', 'counts'],
    queryFn: fetchCatalogCounts,
  });
}
