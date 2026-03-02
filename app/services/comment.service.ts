import { apiInstance } from "../lib/axios";
import type { Comment, PaginatedResponse } from "../types";

export const commentService = {
  async create(
    imageId: string,
    authorName: string,
    content: string,
  ): Promise<Comment> {
    const { data } = await apiInstance.post<Comment>(
      `/images/${imageId}/comments`,
      { authorName, content },
    );
    return data;
  },

  async getByImage(
    imageId: string,
    cursor?: string,
  ): Promise<PaginatedResponse<Comment>> {
    const params: Record<string, string> = {};
    if (cursor) params.cursor = cursor;
    const { data } = await apiInstance.get<PaginatedResponse<Comment>>(
      `/images/${imageId}/comments`,
      { params },
    );
    return data;
  },

  async delete(commentId: string): Promise<void> {
    await apiInstance.delete(`/images/comments/${commentId}`);
  },
};
