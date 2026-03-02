"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { ChatBubbleIcon, CloseIcon } from "../../assets/icons";
import { useEscapeKey } from "../../hooks";
import type { UploadedImage } from "../../types";
import styles from "./ImageDetail.module.scss";

interface ImageDetailProps {
  image: UploadedImage;
  onClose: () => void;
  onAddComment: (imageId: string, authorName: string, content: string) => void;
  hasMoreComments: boolean;
  isLoadingMoreComments: boolean;
  onLoadMoreComments: () => void;
}

export default function ImageDetail({
  image,
  onClose,
  onAddComment,
  hasMoreComments,
  isLoadingMoreComments,
  onLoadMoreComments,
}: ImageDetailProps) {
  const { t, i18n } = useTranslation();
  const [authorName, setAuthorName] = useState("");
  const [content, setContent] = useState("");
  const commentSentinelRef = useRef<HTMLDivElement>(null);

  useEscapeKey(onClose);

  useEffect(() => {
    const sentinel = commentSentinelRef.current;
    if (!sentinel || !hasMoreComments) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isLoadingMoreComments)
          onLoadMoreComments();
      },
      { rootMargin: "100px" },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMoreComments, isLoadingMoreComments, onLoadMoreComments]);

  const locale = i18n.language === "en" ? "en-US" : "vi-VN";

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const trimmedAuthor = authorName.trim();
      const trimmedContent = content.trim();
      if (!trimmedAuthor || !trimmedContent) return;
      onAddComment(image.id, trimmedAuthor, trimmedContent);
      setContent("");
    },
    [authorName, content, image.id, onAddComment],
  );

  return (
    <div
      className={styles.overlay}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className={styles.modal}>
        <div className={styles.imageSection}>
          <Image
            src={image.s3Url}
            alt={image.originalName}
            fill
            unoptimized
            className={styles.previewImage}
            sizes="(max-width: 1024px) 100vw, 50vw"
          />
          <button
            type="button"
            onClick={onClose}
            className={styles.closeButton}
          >
            <CloseIcon className={styles.closeIcon} />
          </button>
        </div>

        <div className={styles.commentsPanel}>
          <div className={styles.header}>
            <h3 className={styles.imageName}>{image.originalName}</h3>
            <p className={styles.imageMeta}>
              {new Date(image.createdAt).toLocaleDateString(locale)} &middot;{" "}
              {t("detail.commentCount", { count: image.comments?.length ?? 0  })}
            </p>
          </div>

          <div className={styles.commentsList}>
            {image.comments?.length === 0 ? (
              <div className={styles.emptyComments}>
                <ChatBubbleIcon className={styles.emptyIcon} strokeWidth={1} />
                <p className={styles.emptyText}>{t("detail.noComments")}</p>
              </div>
            ) : (
              <div className={styles.comments}>
                {image.comments?.map((comment) => (
                  <div key={comment.id} className={styles.comment}>
                    <div className={styles.avatar}>
                      {comment.authorName.charAt(0).toUpperCase()}
                    </div>
                    <div className={styles.commentBody}>
                      <div className={styles.commentHeader}>
                        <span className={styles.authorName}>
                          {comment.authorName}
                        </span>
                        <span className={styles.commentTime}>
                          {new Date(comment.createdAt).toLocaleTimeString(
                            locale,
                            { hour: "2-digit", minute: "2-digit" },
                          )}
                        </span>
                      </div>
                      <p className={styles.commentText}>{comment.content}</p>
                    </div>
                  </div>
                ))}
                {hasMoreComments && (
                  <div
                    ref={commentSentinelRef}
                    className="flex justify-center py-3"
                  >
                    {isLoadingMoreComments && (
                      <div className="h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-blue-600" />
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className={styles.form}>
            <input
              type="text"
              placeholder={t("detail.authorPlaceholder")}
              value={authorName}
              onChange={(e) => setAuthorName(e.target.value)}
              className={styles.authorInput}
            />
            <div className={styles.inputRow}>
              <input
                type="text"
                placeholder={t("detail.commentPlaceholder")}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={styles.commentInput}
              />
              <button
                type="submit"
                disabled={!authorName.trim() || !content.trim()}
                className={styles.submitButton}
              >
                {t("common.send")}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
