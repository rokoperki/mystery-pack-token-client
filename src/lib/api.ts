import axios from "axios";
import {
  Tier,
  PrepareResponse,
  ConfirmResponse,
  Campaign,
  RevealResponse,
  PrepareRequest,
} from "@/types";
import { API_URL } from "./contsants";

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const campaignApi = {
  prepare: async (data: PrepareRequest) => {
    const res = await api.post<PrepareResponse>("/campaigns/prepare", data);
    return res.data;
  },

  getHistory: async (id: string) => {
    const res = await api.get(`/campaigns/${id}/history`);
    return res.data;
  },

  confirm: async (id: string, signature: string) => {
    const res = await api.post<ConfirmResponse>(`/campaigns/${id}/confirm`, {
      signature,
    });
    return res.data;
  },

  getAnalytics: async (id: string) => {
    const res = await api.get(`/campaigns/${id}/analytics`);
    return res.data;
  },

  getOne: async (id: string) => {
    const res = await api.get<Campaign>(`/campaigns/${id}`);
    return res.data;
  },

  getAll: async () => {
    const res = await api.get<Campaign[]>("/campaigns");
    return res.data;
  },

  reveal: async (id: string, packIndex: number, wallet: string) => {
    const res = await api.get<RevealResponse>(
      `/campaigns/${id}/reveal/${packIndex}`,
      {
        params: { wallet },
      }
    );
    return res.data;
  },
};
