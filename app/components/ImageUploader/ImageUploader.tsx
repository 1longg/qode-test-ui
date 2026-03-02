"use client";

import { useTranslation } from "react-i18next";
import { UploadIcon } from "../../assets/icons";
import { useImageUploader } from "../../hooks";
import type { UploadedImage } from "../../types";
import styles from "./ImageUploader.module.scss";

interface ImageUploaderProps {
  onUpload: (images: UploadedImage[]) => void;
}

export default function ImageUploader({ onUpload }: ImageUploaderProps) {
  const { t } = useTranslation();
  const {
    isDragging,
    isUploading,
    inputRef,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    handleFileChange,
    openFilePicker,
    acceptedExtensions,
  } = useImageUploader(onUpload);

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={isUploading ? undefined : openFilePicker}
      className={`${styles.dropzone} ${isDragging ? styles.dragging : ""} ${isUploading ? styles.uploading : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={acceptedExtensions}
        multiple
        onChange={handleFileChange}
        hidden
        disabled={isUploading}
      />

      <div className={styles.content}>
        <div className={styles.iconWrapper}>
          <UploadIcon className={styles.icon} />
        </div>
        <div>
          <p className={styles.title}>
            {isUploading
              ? t("uploader.uploading")
              : isDragging
                ? t("uploader.dropHere")
                : t("uploader.dragOrClick")}
          </p>
          <p className={styles.subtitle}>{acceptedExtensions}</p>
        </div>
      </div>
    </div>
  );
}
