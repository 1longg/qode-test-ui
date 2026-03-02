"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { ImageIcon } from "../assets/icons";
import {
  ImageDetail,
  ImageGallery,
  ImageUploader,
  LanguageSwitcher,
} from "../components";
import { imageService, commentService } from "../services";
import type { Comment, UploadedImage } from "../types";

export default function UploadPage() {
  const { t } = useTranslation();
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [selectedImage, setSelectedImage] = useState<UploadedImage | null>(
    null,
  );
  const [imageCursor, setImageCursor] = useState<string | null>(null);
  const [hasMoreImages, setHasMoreImages] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [commentCursor, setCommentCursor] = useState<string | null>(null);
  const [hasMoreComments, setHasMoreComments] = useState(false);
  const [isLoadingMoreComments, setIsLoadingMoreComments] = useState(false);

  const initialLoad = useRef(false);

  useEffect(() => {
    if (initialLoad.current) return;
    initialLoad.current = true;
    imageService.getAll().then((res) => {
      setImages(res.data.map((img) => ({ ...img, comments: [] })));
      setImageCursor(res.nextCursor);
      setHasMoreImages(res.nextCursor !== null);
    }).catch(() => {
      toast.error(t("toast.loadFailed"));
    });
  }, [t]);

  const handleLoadMoreImages = useCallback(async () => {
    if (!imageCursor || isLoadingMore) return;
    setIsLoadingMore(true);
    try {
      const res = await imageService.getAll(imageCursor);
      setImages((prev) => [
        ...prev,
        ...res.data.map((img) => ({ ...img, comments: [] })),
      ]);
      setImageCursor(res.nextCursor);
      setHasMoreImages(res.nextCursor !== null);
    } catch {
      toast.error(t("toast.loadFailed"));
    } finally {
      setIsLoadingMore(false);
    }
  }, [imageCursor, isLoadingMore, t]);

  const handleUpload = useCallback((newImages: UploadedImage[]) => {
    setImages((prev) => [...newImages, ...prev]);
  }, []);

  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await imageService.delete(id);
        setImages((prev) => prev.filter((i) => i.id !== id));
        if (selectedImage?.id === id) setSelectedImage(null);
      } catch {
        toast.error(t("toast.deleteFailed"));
      }
    },
    [selectedImage, t],
  );

  const handleAddComment = useCallback(
    async (imageId: string, authorName: string, content: string) => {
      try {
        const comment = await commentService.create(
          imageId,
          authorName,
          content,
        );
        setImages((prev) =>
          prev.map((img) =>
            img.id === imageId
              ? { ...img, comments: [...img.comments, comment] }
              : img,
          ),
        );
      } catch {
        toast.error(t("toast.commentFailed"));
      }
    },
    [t],
  );

  const handleSelect = useCallback(
    async (image: UploadedImage) => {
      try {
        const res = await commentService.getByImage(image.id);
        const withComments = { ...image, comments: res.data };
        setImages((prev) =>
          prev.map((img) => (img.id === image.id ? withComments : img)),
        );
        setSelectedImage(withComments);
        setCommentCursor(res.nextCursor);
        setHasMoreComments(res.nextCursor !== null);
      } catch {
        setSelectedImage(image);
      }
    },
    [],
  );

  const handleLoadMoreComments = useCallback(async () => {
    if (!commentCursor || !selectedImage || isLoadingMoreComments) return;
    setIsLoadingMoreComments(true);
    try {
      const res = await commentService.getByImage(
        selectedImage.id,
        commentCursor,
      );
      const appendComments = (prev: Comment[]) => [...prev, ...res.data];
      setImages((prev) =>
        prev.map((img) =>
          img.id === selectedImage.id
            ? { ...img, comments: appendComments(img.comments) }
            : img,
        ),
      );
      setCommentCursor(res.nextCursor);
      setHasMoreComments(res.nextCursor !== null);
    } catch {
      toast.error(t("toast.loadFailed"));
    } finally {
      setIsLoadingMoreComments(false);
    }
  }, [commentCursor, selectedImage, isLoadingMoreComments, t]);

  const currentSelected = selectedImage
    ? images.find((i) => i.id === selectedImage.id) ?? null
    : null;

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <header className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
        <div className="mx-auto flex max-w-6xl items-center gap-3 px-6 py-5">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600">
            <ImageIcon className="h-5 w-5 text-white" strokeWidth={2} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
              {t("common.appName")}
            </h1>
            <p className="text-sm text-zinc-500">
              {t("header.subtitle")}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            {images.length > 0 && (
              <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                {t("common.imageCount", { count: images.length })}
              </span>
            )}
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-8">
        <section>
          <ImageUploader onUpload={handleUpload} />
        </section>

        <section className="mt-8">
          <ImageGallery
            images={images}
            onSelect={handleSelect}
            onDelete={handleDelete}
            hasMore={hasMoreImages}
            isLoadingMore={isLoadingMore}
            onLoadMore={handleLoadMoreImages}
          />
        </section>
      </main>

      {currentSelected && (
        <ImageDetail
          image={currentSelected}
          onClose={() => setSelectedImage(null)}
          onAddComment={handleAddComment}
          hasMoreComments={hasMoreComments}
          isLoadingMoreComments={isLoadingMoreComments}
          onLoadMoreComments={handleLoadMoreComments}
        />
      )}
    </div>
  );
}
