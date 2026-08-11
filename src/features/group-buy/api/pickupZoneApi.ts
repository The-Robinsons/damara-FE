import axiosInstance from "../../../shared/api/axiosInstance";
import type { ApiPickupZone, ApiPickupZoneListResponse } from "../../../shared/api/swaggerTypes";

export const getPickupZones = () =>
  axiosInstance.get<ApiPickupZoneListResponse>("/pickup-zones");

export const getPickupZone = (id: string) =>
  axiosInstance.get<ApiPickupZone>(`/pickup-zones/${id}`);
