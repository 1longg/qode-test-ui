"use client";

import type { ReactNode } from "react";
import "./index";

export default function I18nProvider({ children }: { children: ReactNode }) {
  return <>{children}</>;
}
