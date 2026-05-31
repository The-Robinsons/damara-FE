import axios from "axios";
import axiosInstance from "./axiosInstance";

const SAFE_UPLOAD_BYTES = 900 * 1024;
const MAX_IMAGE_DIMENSION = 1600;
const ACCEPTED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/gif", "image/webp"]);

export class ImageUploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ImageUploadError";
  }
}

function getResizedDimensions(width: number, height: number) {
  const scale = Math.min(1, MAX_IMAGE_DIMENSION / Math.max(width, height));
  return {
    width: Math.max(1, Math.round(width * scale)),
    height: Math.max(1, Math.round(height * scale)),
  };
}

function canvasToBlob(canvas: HTMLCanvasElement, quality: number) {
  return new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", quality));
}

async function compressImage(file: File) {
  const objectUrl = URL.createObjectURL(file);
  const image = new Image();

  try {
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = () => reject(new ImageUploadError("이미지를 읽을 수 없어요. 다른 파일을 선택해 주세요."));
      image.src = objectUrl;
    });

    let { width, height } = getResizedDimensions(image.naturalWidth, image.naturalHeight);
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    if (!context) throw new ImageUploadError("이미지를 처리하지 못했어요. 다시 시도해 주세요.");

    for (let attempt = 0; attempt < 6; attempt += 1) {
      canvas.width = width;
      canvas.height = height;
      context.clearRect(0, 0, width, height);
      context.drawImage(image, 0, 0, width, height);

      const quality = Math.max(0.48, 0.88 - attempt * 0.08);
      const blob = await canvasToBlob(canvas, quality);
      if (!blob) break;
      if (blob.size <= SAFE_UPLOAD_BYTES) {
        const baseName = file.name.replace(/\.[^.]+$/, "") || "damara-image";
        return new File([blob], `${baseName}.webp`, { type: "image/webp" });
      }

      width = Math.max(1, Math.round(width * 0.82));
      height = Math.max(1, Math.round(height * 0.82));
    }
  } finally {
    URL.revokeObjectURL(objectUrl);
  }

  throw new ImageUploadError("이미지 용량을 줄이지 못했어요. 900KB 이하 이미지를 선택해 주세요.");
}

export async function prepareImageForUpload(file: File) {
  if (!ACCEPTED_IMAGE_TYPES.has(file.type)) {
    throw new ImageUploadError("JPG, PNG, GIF, WEBP 이미지만 등록할 수 있어요.");
  }
  if (file.size <= SAFE_UPLOAD_BYTES) return file;
  if (file.type === "image/gif") {
    throw new ImageUploadError("GIF 이미지는 900KB 이하만 등록할 수 있어요.");
  }
  return compressImage(file);
}

export function getImageUploadErrorMessage(error: unknown) {
  if (error instanceof ImageUploadError) return error.message;
  if (!axios.isAxiosError(error)) return "이미지 업로드에 실패했어요. 다시 시도해 주세요.";
  if (error.response?.status === 413) {
    return "서버가 이미지 용량을 허용하지 않았어요. 더 작은 이미지를 선택해 주세요.";
  }
  const message = error.response?.data?.message;
  return typeof message === "string" ? message : "이미지 업로드에 실패했어요. 다시 시도해 주세요.";
}

export const uploadImage = async (file: File) => {
  const uploadFile = await prepareImageForUpload(file);
  const formData = new FormData();
  formData.append("image", uploadFile);

  const res = await axiosInstance.post(`/upload/image`, formData);

  return res.data;
};

export const uploadImages = async (files: File[]) => {
  const uploadFiles = await Promise.all(files.map(prepareImageForUpload));
  const formData = new FormData();
  uploadFiles.forEach((file) => formData.append("images", file));

  const res = await axiosInstance.post(`/upload/images`, formData);

  return res.data;
};
