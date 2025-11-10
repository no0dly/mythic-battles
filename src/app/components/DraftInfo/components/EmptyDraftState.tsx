import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { ClipboardList } from "lucide-react";

interface EmptyDraftStateProps {
  type: "no_draft" | "no_picks";
  draftStatus?: string;
}

export const EmptyDraftState = ({ type, draftStatus }: EmptyDraftStateProps) => {
  const { t } = useTranslation();

  if (type === "no_draft") {
    return (
      <div className="rounded-xl border-2 border-dashed border-gray-300 bg-gradient-to-br from-gray-50 to-gray-100 p-6 text-center shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-200">
          <svg
            className="h-6 w-6 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
        </div>
        <p className="font-medium text-gray-600">{t("noDraftAvailable")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-xl border-2 border-gray-200 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ClipboardList className="h-4 w-4 text-purple-600" />
          <h4 className="text-sm font-semibold text-gray-800">
            {t("draftInformation")}
          </h4>
        </div>
        {draftStatus && (
          <Badge
            variant="outline"
            className="border-purple-300 text-purple-700 bg-purple-50"
          >
            {draftStatus}
          </Badge>
        )}
      </div>
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-center">
        <p className="text-sm font-medium text-amber-800">
          {t("draftHistoryEmpty")}
        </p>
      </div>
    </div>
  );
};

