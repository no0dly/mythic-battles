import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Users } from "lucide-react";
import type { Team } from "@/types/database.types";
import { PLAYER_ACCENT_STYLES, TEAM_ACCENTS } from "@/utils/drafts/playerAccents";

interface TeamSetupCardProps {
  team: Team;
  children: ReactNode;
}

export function TeamSetupCard({ team, children }: TeamSetupCardProps) {
  const { t } = useTranslation();
  const accentStyles = PLAYER_ACCENT_STYLES[TEAM_ACCENTS[team]];

  return (
    <section
      className={`flex min-w-0 flex-col gap-3 rounded-xl border-2 p-3 @lg:p-4 ${accentStyles.border}`}
      data-testid={`team-setup-card-${team}`}
    >
      <header className={`flex items-center gap-2 text-sm font-semibold ${accentStyles.title}`}>
        <span className={`flex size-6 items-center justify-center rounded-full ${accentStyles.badge}`}>
          <Users className="size-3.5" />
        </span>
        {t("draftTeamLabel", { number: team })}
      </header>
      {children}
    </section>
  );
}

interface TeamMemberRowProps {
  label: string;
  name: string;
}

/** A fixed (non-selectable) team member, e.g. the creator or a practice opponent. */
export function TeamMemberRow({ label, name }: TeamMemberRowProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="text-sm font-medium">{label}</span>
      <div className="flex h-9 items-center rounded-md border bg-background/70 px-3 text-sm">
        <span className="truncate">{name}</span>
      </div>
    </div>
  );
}
