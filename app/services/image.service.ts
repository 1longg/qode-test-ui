import axios from "axios";
import { apiInstance } from "../lib/axios";
import type {
  PaginatedResponse,
  PresignResponse,
  UploadedImage,
} from "../types";

export const imageService = {
  async presign(file: File): Promise<PresignResponse> {
    const { data } = await apiInstance.post<PresignResponse>(
      "/images/presign",
      {
        originalName: file.name,
        mimeType: file.type,
        size: file.size,
      },
    );
    return data;
  },

  async uploadToS3(presignedUrl: string, file: File): Promise<void> {
    await axios.put(presignedUrl, file, {
      headers: { "Content-Type": file.type },
    });
  },

  async confirmUpload(imageId: string): Promise<UploadedImage> {
    const { data } = await apiInstance.patch<UploadedImage>(
      `/images/${imageId}/confirm`,
    );
    return data;
  },

  async getAll(cursor?: string): Promise<PaginatedResponse<UploadedImage>> {
    const params: Record<string, string> = {};
    if (cursor) params.cursor = cursor;
    const { data } = await apiInstance.get<PaginatedResponse<UploadedImage>>(
      "/images",
      { params },
    );
    return data;
  },

  async getOne(id: string): Promise<UploadedImage> {
    const { data } = await apiInstance.get<UploadedImage>(`/images/${id}`);
    return data;
  },

  async delete(id: string): Promise<void> {
    await apiInstance.delete(`/images/${id}`);
  },
};
