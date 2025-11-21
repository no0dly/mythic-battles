import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { SessionWithPlayers } from "@/server/api/routers/sessions/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  FINISH_GAME_FORM_DEFAULT_VALUES,
  WIN_CONDITION_OPTIONS,
} from "./constants";
import {
  createFinishGameFormSchema,
  mapSessionPlayersToOptions,
} from "./utils";
import type { FinishGameFormValues } from "./types";
import { api } from "@/trpc/client";
import { toast } from "sonner";

interface SessionDrawerButtonsInProgressProps {
  session: SessionWithPlayers;
  clearSession: () => void;
}

export default function SessionDrawerButtonsInProgress({
  session,
  clearSession,
}: SessionDrawerButtonsInProgressProps) {
  const { t } = useTranslation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const utils = api.useUtils();
  const formSchema = useMemo(() => createFinishGameFormSchema(t), [t]);

  const form = useForm<FinishGameFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: FINISH_GAME_FORM_DEFAULT_VALUES,
  });

  const { mutate: finishGame, isPending: isFinishingGame } =
    api.games.finishGame.useMutation({
      onSuccess: () => {
        utils.sessions.invalidate();
        clearSession();
        handleCloseModal();
      },
      onError: (error) => {
        toast.error(error.message || t("errorFinishingGame"));
      },
    });

  const playerOptions = useMemo(
    () => mapSessionPlayersToOptions(session),
    [session]
  );

  const handleFormSubmit = (values: FinishGameFormValues) => {
    const currentGame = session.game_list?.[session.game_list.length - 1];

    if (!currentGame) {
      return;
    }

    finishGame({
      gameId: currentGame,
      sessionId: session.id,
      winnerId: values.playerId,
    });
    utils.sessions.invalidate();

    handleCloseModal();
  };

  const handleOpenChange = (open: boolean) => {
    setIsModalOpen(open);
    if (!open) {
      form.reset();
    }
  };

  const handleOpenModal = () => {
    handleOpenChange(true);
  };

  const handleCloseModal = () => {
    handleOpenChange(false);
  };

  return (
    <Dialog open={isModalOpen} onOpenChange={handleOpenChange}>
      <Button
        onClick={handleOpenModal}
        variant="default"
        size="lg"
        loading={isFinishingGame}
        className="whitespace-nowrap w-full"
      >
        {t("finishGame")}
      </Button>

      <DialogContent>
        <DialogHeader>
          <DialogTitle className="mb-4">{t("finishGame")}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="space-y-10"
            onSubmit={form.handleSubmit(handleFormSubmit)}
          >
            <FormField
              control={form.control}
              name="playerId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("selectWinner")}</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("selectWinner")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {playerOptions.map((player) => (
                        <SelectItem key={player.id} value={player.id}>
                          {player.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="winCondition"
              render={({ field: { onChange, value } }) => (
                <FormItem>
                  <FormLabel>{t("selectWinCondition")}</FormLabel>
                  <Select onValueChange={onChange} value={value}>
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("selectWinCondition")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {WIN_CONDITION_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {t(option.label)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                loading={isFinishingGame}
                onClick={handleCloseModal}
              >
                {t("cancel")}
              </Button>
              <Button type="submit" loading={isFinishingGame}>
                {t("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
