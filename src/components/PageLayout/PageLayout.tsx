"use client";
import type { TranslationKey } from "@/i18n";
import { useTranslation } from "react-i18next";

type Props = {
  title: TranslationKey;
  children: React.ReactNode;
};

export default function PageLayout({ title, children }: Props) {
  const { t } = useTranslation();
  return (
    <main className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <h2 className="text-3xl font-semibold text-gray-900 dark:text-white mb-6">
        {t(title)}
      </h2>
      {children}
    </main>
  );
}
