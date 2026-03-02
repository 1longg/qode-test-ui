"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { ChatBubbleIcon, CloseIcon, ImageIcon } from "../../assets/icons";
import type { UploadedImage } from "../../types";
import styles from "./ImageGallery.module.scss";

interface ImageGalleryProps {
  images: UploadedImage[];
  onSelect: (image: UploadedImage) => void;
  onDelete: (id: string) => void;
  hasMore: boolean;
  isLoadingMore: boolean;
  onLoadMore: () => void;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageGallery({
  images,
  onSelect,
  onDelete,
  hasMore,
  isLoadingMore,
  onLoadMore,
}: ImageGalleryProps) {
  const { t } = useTranslation();
  const sentinelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel || !hasMore) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMore) onLoadMore();
      },
      { rootMargin: "200px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, onLoadMore]);

  if (images.length === 0) {
    return (
      <div className={styles.emptyState}>
        <ImageIcon className={styles.emptyIcon} />
        <p className={styles.emptyText}>{t("gallery.empty")}</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.grid}>
        {images.map((image) => (
          <div key={image.id} className={styles.card}>
            <button
              type="button"
              onClick={() => onSelect(image)}
              className={styles.selectButton}
            >
              <div className={styles.thumbnailWrapper}>
                <Image
                  src={image.s3Url}
                  alt={image.originalName}
                  fill
                  unoptimized
                  className={styles.thumbnail}
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
            </button>

            <div className={styles.info}>
              <p className={styles.fileName} title={image.originalName}>
                {image.originalName}
              </p>
              <div className={styles.meta}>
                <span className={styles.fileSize}>
                  {formatFileSize(image.size)}
                </span>
                {image.comments?.length > 0 && (
                  <span className={styles.commentCount}>
                    <ChatBubbleIcon className={styles.commentIcon} />
                    {image.comments?.length}
                  </span>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(image.id);
              }}
              className={styles.deleteButton}
              title={t("gallery.deleteImage")}
            >
              <CloseIcon className={styles.deleteIcon} />
            </button>
          </div>
        ))}
      </div>
      {hasMore && (
        <div ref={sentinelRef} className="flex justify-center py-6">
          {isLoadingMore && (
            <div className="h-6 w-6 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
          )}
        </div>
      )}
    </>
  );
}
