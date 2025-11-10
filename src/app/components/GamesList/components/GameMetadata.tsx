import { useTranslation } from "react-i18next";
import { CircleUserRound, Clock4 } from "lucide-react";

interface GameMetadataProps {
  createdAt: string;
  finishedAt: string | null;
  createdBy?: string | null;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const GameMetadata = ({ createdAt, finishedAt, createdBy }: GameMetadataProps) => {
  const { t } = useTranslation();

  return (
    <div className="space-y-2 rounded-lg border border-gray-200 bg-white p-4 text-xs">
      {createdBy && (
        <div className="flex items-center justify-between">
          <div className="flex flex-shrink-0 items-center gap-2 text-gray-600">
            <CircleUserRound className="h-3.5 w-3.5" />
            <span className="font-medium">{t("createdBy")}:</span>
          </div>
          <span className="font-mono text-gray-800">{createdBy}</span>
        </div>
      )}
      <div className={`flex items-center justify-between ${createdBy ? 'border-t border-gray-100 pt-2' : ''}`}>
        <div className="flex flex-shrink-0 items-center gap-2 text-gray-600">
          <Clock4 className="h-3.5 w-3.5" />
          <span className="font-medium">{t("created")}:</span>
        </div>
        <span className="font-mono text-gray-800">{formatDate(createdAt)}</span>
      </div>
      {finishedAt && (
        <div className="flex items-center justify-between border-t border-gray-100 pt-2">
          <div className="flex items-center gap-2 text-gray-600">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="font-medium">{t("finished")}:</span>
          </div>
          <span className="font-mono text-gray-800">{formatDate(finishedAt)}</span>
        </div>
      )}
    </div>
  );
};

