import { useTranslation } from "react-i18next";

interface DraftCardsErrorProps {
  message?: string;
}

function DraftCardsError({ message }: DraftCardsErrorProps) {
  const { t } = useTranslation();
  return (
    <div className="flex items-center justify-center h-full">
      <div className="text-center">
        <p className="text-destructive text-lg font-semibold mb-2">
          {t("error")}
        </p>
        <p className="text-muted-foreground">
          {message || t("errorLoadingCards")}
        </p>
      </div>
    </div>
  );
}

export default DraftCardsError;
