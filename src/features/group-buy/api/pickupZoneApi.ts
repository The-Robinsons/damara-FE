import axiosInstance from "../../../shared/api/axiosInstance";

export const getPickupZones = () =>
  axiosInstance.get("/pickup-zones");

export const getPickupZone = (id: string) =>
  axiosInstance.get(`/pickup-zones/${id}`);
