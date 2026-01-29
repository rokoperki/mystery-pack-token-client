import { useQuery } from '@tanstack/react-query';
import { campaignApi } from '@/lib/api';
import { queryKeys } from '@/lib/query-keys';

export function useCampaigns() {
  return useQuery({
    queryKey: queryKeys.campaigns.all,
    queryFn: campaignApi.getAll,
  });
}