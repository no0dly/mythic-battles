import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";

interface GameStatusBadgeProps {
  status: string;
}

export const GameStatusBadge = ({ status }: GameStatusBadgeProps) => {
  const { t } = useTranslation();

  switch (status) {
    case "in_progress":
      return (
        <Badge variant="default" className="bg-blue-600 hover:bg-blue-700 text-white">
          {t("inProgress")}
        </Badge>
      );
    case "finished":
      return (
        <Badge variant="outline" className="border-green-600 text-green-700 bg-green-50">
          {t("finished")}
        </Badge>
      );
    case "error":
      return (
        <Badge variant="destructive" className="bg-red-600 hover:bg-red-700 text-white">
          {t("error")}
        </Badge>
      );
    default:
      return (
        <Badge variant="outline" className="border-gray-400 text-gray-600">
          {status}
        </Badge>
      );
  }
};

