import type { ApiPost } from "../../shared/api/swaggerTypes";

export type HomePostImage = string | { imageUrl?: string; url?: string };

export type HomePost = Omit<ApiPost, "images"> & {
  image?: string;
  type?: string;
  images?: HomePostImage[];
};
