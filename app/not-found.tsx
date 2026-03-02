"use client";

import Link from "next/link";
import { useTranslation } from "react-i18next";

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-50 px-6 dark:bg-zinc-950">
      <p className="text-8xl font-bold text-zinc-200 dark:text-zinc-800">404</p>
      <h1 className="mt-4 text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
        {t("notFound.title")}
      </h1>
      <p className="mt-2 text-center text-zinc-500 dark:text-zinc-400">
        {t("notFound.description")}
      </p>
      <Link
        href="/upload"
        className="mt-8 rounded-lg bg-blue-600 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-blue-700"
      >
        {t("notFound.backToUpload")}
      </Link>
    </div>
  );
}
