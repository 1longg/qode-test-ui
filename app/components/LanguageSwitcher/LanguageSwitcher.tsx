"use client";

import { useTranslation } from "react-i18next";
import styles from "./LanguageSwitcher.module.scss";

const LANGUAGES = [
  { code: "vi", label: "VI" },
  { code: "en", label: "EN" },
] as const;

export default function LanguageSwitcher() {
  const { i18n } = useTranslation();

  return (
    <div className={styles.switcher}>
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => i18n.changeLanguage(code)}
          className={`${styles.option} ${i18n.language === code ? styles.active : ""}`}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
