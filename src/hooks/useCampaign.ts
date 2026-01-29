import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

export function useCampaign(id: string) {
  return useQuery({
    queryKey: queryKeys.campaigns.one(id),
    queryFn: () => campaignApi.getOne(id),
    enabled: !!id,
  });
}