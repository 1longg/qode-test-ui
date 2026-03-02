import imageCompression from "browser-image-compression";
import { useCallback, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { imageService } from "../services";
import type { UploadedImage } from "../types";

const COMPRESSION_OPTIONS = {
  maxSizeMB: 1,
  maxWidthOrHeight: 1920,
  useWebWorker: true,
};

const ACCEPTED_MIME_TYPES = ["image/png", "image/jpeg"] as const;

const ACCEPTED_EXTENSIONS = ACCEPTED_MIME_TYPES.map(
  (t) => `.${t.split("/")[1]}`,
).join(", ");

function isAcceptedImage(file: File): boolean {
  return (ACCEPTED_MIME_TYPES as readonly string[]).includes(file.type);
}

function filterValidImages(files: File[]): {
  valid: File[];
  rejected: File[];
} {
  const valid: File[] = [];
  const rejected: File[] = [];
  for (const file of files) {
    (isAcceptedImage(file) ? valid : rejected).push(file);
  }
  return { valid, rejected };
}

export function useImageUploader(
  onUpload: (images: UploadedImage[]) => void,
) {
  const { t } = useTranslation();
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const processFiles = useCallback(
    async (files: File[]) => {
      const { valid, rejected } = filterValidImages(files);

      if (rejected.length > 0) {
        const names = rejected.map((f) => f.name).join(", ");
        toast.error(t("toast.unsupported", { names }), {
          description: t("toast.unsupportedDesc", {
            extensions: ACCEPTED_EXTENSIONS,
          }),
        });
      }

      if (valid.length === 0) return;

      setIsUploading(true);

      try {
        const uploaded: UploadedImage[] = [];

        for (const file of valid) {
          const compressed = await imageCompression(file, COMPRESSION_OPTIONS);
          const compressedFile = new File([compressed], file.name, {
            type: compressed.type,
          });
          const { image, presignedUrl } =
            await imageService.presign(compressedFile);
          await imageService.uploadToS3(presignedUrl, compressedFile);
          const confirmed = await imageService.confirmUpload(image.id);
          uploaded.push({ ...confirmed, comments: [] });
        }

        onUpload(uploaded);
        toast.success(t("toast.uploaded", { count: uploaded.length }));
      } catch {
        toast.error(t("toast.uploadFailed"));
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload, t],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      processFiles(Array.from(e.dataTransfer.files));
    },
    [processFiles],
  );

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      processFiles(Array.from(e.target.files ?? []));
      e.target.value = "";
    },
    [processFiles],
  );

  const openFilePicker = useCallback(() => {
    inputRef.current?.click();
  }, []);

  return {
    isDragging,
    isUploading,
    inputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    openFilePicker,
    acceptedExtensions: ACCEPTED_EXTENSIONS,
  };
}
