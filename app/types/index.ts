export interface Comment {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  imageId: string;
}

export interface UploadedImage {
  id: string;
  originalName: string;
  s3Url: string;
  mimeType: string;
  size: number;
  status: "PENDING" | "UPLOADED";
  createdAt: string;
  comments: Comment[];
}

export interface PresignResponse {
  image: UploadedImage;
  presignedUrl: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  nextCursor: string | null;
}
