import { useTranslation } from "react-i18next";
import type { DraftSeat } from "@/utils/drafts/seats";
import { PLAYER_ACCENT_STYLES } from "@/utils/drafts/playerAccents";

export type NamedDraftSeat = DraftSeat & { name: string };

interface MultiplayerInitialRollDisplayProps {
  seats: NamedDraftSeat[];
}

export const MultiplayerInitialRollDisplay = ({ seats }: MultiplayerInitialRollDisplayProps) => {
  const { t } = useTranslation();

  return (
    <div className="rounded-xl border-2 border-indigo-300 bg-gradient-to-r from-indigo-50 to-blue-50 p-4 shadow-sm">
      <div className="mb-3 flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-indigo-900">
          {t("rollForTurn")}
        </span>
      </div>
      <div className="flex flex-wrap items-start justify-around gap-3">
        {seats.map((seat) => (
          <div key={seat.userId} className="flex min-w-0 flex-col items-center text-center">
            <div className="mb-2 flex max-w-28 items-center gap-1 text-xs font-medium text-gray-600">
              <span
                className={`rounded-full px-1.5 font-bold ${PLAYER_ACCENT_STYLES[seat.accent].badge}`}
              >
                {seat.seatLabel}
              </span>
              <span className="truncate">{seat.name}</span>
            </div>
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white shadow-md">
              <span className="text-3xl font-black text-indigo-700">{seat.roll}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
