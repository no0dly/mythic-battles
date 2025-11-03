"use client";
import type { TranslationKey } from "@/i18n";
import { useTranslation } from "react-i18next";

type Props = {
  title?: TranslationKey;
  children: React.ReactNode;
};

export default function PageLayout({ title, children }: Props) {
  const { t } = useTranslation();
  // Header height: 64px (h-16), padding top: 48px (py-12 = 3rem), padding bottom: 48px
  // Total: 64px + 48px + 48px = 160px
  return (
    <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8 h-[calc(100vh-4rem-3rem-3rem)] overflow-hidden flex flex-col">
      {title && (
        <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6 flex-shrink-0">
          {t(title)}
        </h2>
      )}
      <div className="flex-1 min-h-0 overflow-hidden">{children}</div>
    </main>
  );
}
