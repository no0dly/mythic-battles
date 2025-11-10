import { useTranslation } from "react-i18next";

interface InitialRollDisplayProps {
  player1Roll: number;
  player2Roll: number;
  player1Name: string;
  player2Name: string;
}

export const InitialRollDisplay = ({
  player1Roll,
  player2Roll,
  player1Name,
  player2Name,
}: InitialRollDisplayProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
          {t("rollForTurn")}
        </span>
      </div>
      <div className="flex items-center justify-around">
        <div className="text-center flex flex-col items-center">
          <div className="mb-2 text-xs font-medium text-gray-600">
            {player1Name}
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-md">
            <span className="text-3xl font-black text-indigo-700">
              {player1Roll}
            </span>
          </div>
        </div>
        <div className="text-xl font-bold text-indigo-400">VS</div>
        <div className="text-center flex flex-col items-center">
          <div className="mb-2 text-xs font-medium text-gray-600">
            {player2Name}
          </div>
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-md">
            <span className="text-3xl font-black text-indigo-700">
              {player2Roll}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

