"use client";

import { useTranslation } from "react-i18next";
import { useWatch, type Control } from "react-hook-form";
import { SelectWithLoading } from "@/components/FormFields";
import { GAME_MODE, SOLO_PRACTICE_PLAYER_ID, TEAM } from "@/types/constants";
import { useUserProfile } from "@/hooks/useUserProfile";
import {
  TEAMMATE_SLOT,
  isPracticeSelection,
  type DraftSettingsFormValues,
} from "@/app/draft-settings/components/DraftSettings/constants";
import { TeamMemberRow, TeamSetupCard } from "./components";

interface FriendOption {
  value: string;
  label: string;
}

interface MultiplayerOpponentsFieldProps {
  control: Control<DraftSettingsFormValues>;
  friends: FriendOption[];
  isLoading: boolean;
}

const FIRST_OPPONENT_SEAT = 2;
const OTHER_TEAM_SLOTS = [1, 2];

/**
 * 1v1v1: one select per opponent. 2v2: two team cards, the creator's teammate
 * in slot 0 and the other team in slots 1-2. Picking practice in the first
 * slot fills every other seat with practice players.
 */
export function MultiplayerOpponentsField({
  control,
  friends,
  isLoading,
}: MultiplayerOpponentsFieldProps) {
  const { t } = useTranslation();
  const { user } = useUserProfile();
  const mode = useWatch({ control, name: "mode" });
  const opponentIds = useWatch({ control, name: "opponentIds" });
  const opponentId = useWatch({ control, name: "opponentId" });
  const isPractice = isPracticeSelection({ mode, opponentId, opponentIds });

  const optionsForSlot = (slot: number) => {
    const takenElsewhere = new Set(opponentIds.filter((_, i) => i !== slot));
    const available = friends.filter((friend) => !takenElsewhere.has(friend.value));
    return slot === 0
      ? [{ value: SOLO_PRACTICE_PLAYER_ID, label: t("practiceOpponentMultiplayer") }, ...available]
      : available;
  };

  const renderSlot = (slot: number, label: string) => (
    <SelectWithLoading
      key={slot}
      control={control}
      name={`opponentIds.${slot}`}
      label={label}
      options={optionsForSlot(slot)}
      isLoading={isLoading}
      emptyMessageKey="noFriendsYet"
    />
  );

  const practiceHint = isPractice && (
    <p className="text-sm text-muted-foreground">{t("draftSettingsPracticeSeatsHint")}</p>
  );

  if (mode === GAME_MODE.TEAM_2V2) {
    return (
      <div className="flex flex-col gap-3" data-testid="multiplayer-opponents-field">
        <div className="grid grid-cols-1 items-stretch gap-3 @lg:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] @lg:gap-4">
          <TeamSetupCard team={TEAM.FIRST}>
            <TeamMemberRow
              label={t("draftSettingsYou")}
              name={user?.displayName ?? t("draftSeatFallbackName")}
            />
            {renderSlot(TEAMMATE_SLOT, t("draftSettingsTeammate"))}
          </TeamSetupCard>

          <span className="self-center text-center text-sm font-bold uppercase text-muted-foreground">
            {t("versusShort")}
          </span>

          <TeamSetupCard team={TEAM.SECOND}>
            {OTHER_TEAM_SLOTS.map((slot, index) =>
              isPractice ? (
                <TeamMemberRow
                  key={slot}
                  label={t("draftSettingsOpponent", { number: index + 1 })}
                  name={t("practiceOpponent")}
                />
              ) : (
                renderSlot(slot, t("draftSettingsOpponent", { number: index + 1 }))
              )
            )}
          </TeamSetupCard>
        </div>
        {practiceHint}
        <p className="text-xs text-muted-foreground">{t("draftSettingsTeamSeatingHint")}</p>
      </div>
    );
  }

  const visibleSlots = isPractice ? [0] : opponentIds.map((_, i) => i);

  return (
    <div className="flex max-w-[400px] flex-col gap-4" data-testid="multiplayer-opponents-field">
      {visibleSlots.map((slot) =>
        renderSlot(slot, t("draftSettingsPlayerSlot", { number: slot + FIRST_OPPONENT_SEAT }))
      )}
      {practiceHint}
    </div>
  );
}
