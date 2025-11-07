"use client";
import type { TranslationKey } from "@/i18n";
import { useTranslation } from "react-i18next";

type Props = {
  title?: TranslationKey;
  children: React.ReactNode;
};

export default function PageLayout({ title, children }: Props) {
  const { t } = useTranslation();
  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-8 md:py-12 px-4 sm:px-6 lg:px-8 h-full flex flex-col min-h-0">
      {title && (
        <h2 className="text-2xl sm:text-3xl font-semibold text-gray-900 dark:text-white mb-4 sm:mb-6 flex-shrink-0">
          {t(title)}
        </h2>
      )}
      <div className="flex-1 min-h-0 overflow-y-auto">{children}</div>
    </div>
  );
}
