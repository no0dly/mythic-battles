import { z } from "zod";
import { router, protectedProcedure } from "../trpc";
import { TRPCError } from "@trpc/server";
import { zUuid } from "../schemas";
import type { GameInvitation } from "@/types/database.types";
import { GAME_STATUS, SESSION_STATUS } from "@/types/constants";

export const gameInvitationsRouter = router({
  // Создать приглашение
  create: protectedProcedure
    .input(
      z.object({
        game_id: zUuid,
        session_id: zUuid,
        invitee_id: zUuid,
        message: z.string().optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Проверка что игра существует
      const { data: game, error: gameError } = await ctx.supabase
        .from("games")
        .select("id, session_id")
        .eq("id", input.game_id)
        .single();

      if (gameError || !game) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Game not found",
        });
      }

      // Проверка что session существует
      const { data: session, error: sessionError } = await ctx.supabase
        .from("sessions")
        .select("player1_id, player2_id")
        .eq("id", input.session_id)
        .single();

      if (sessionError || !session) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Session not found",
        });
      }

      // Проверка что текущий пользователь - участник сессии
      const sessionData = session as { player1_id: string; player2_id: string };
      if (sessionData.player1_id !== userId && sessionData.player2_id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not a participant in this session",
        });
      }

      // Проверка что invitee - второй участник сессии
      const inviteeId = input.invitee_id;
      if (sessionData.player1_id !== inviteeId && sessionData.player2_id !== inviteeId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitee must be a participant in this session",
        });
      }

      // Проверка на существующее активное приглашение
      const { data: existingInvitation } = await ctx.supabase
        .from("game_invitations")
        .select("id, status")
        .eq("game_id", input.game_id)
        .eq("status", "pending")
        .maybeSingle();

      if (existingInvitation) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Active invitation already exists for this game",
        });
      }

      // Создание приглашения
      const { data: invitation, error: createError } = await ctx.supabase
        .from("game_invitations")
        .insert({
          game_id: input.game_id,
          session_id: input.session_id,
          inviter_id: userId,
          invitee_id: inviteeId,
          status: "pending",
          message: input.message,
        } as never)
        .select()
        .single();

      if (createError || !invitation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create invitation",
          cause: createError,
        });
      }

      // Обновить статус игры
      await ctx.supabase
        .from("games")
        .update({ status: GAME_STATUS.INVITE_TO_DRAFT } as never)
        .eq("id", input.game_id);

      return invitation as GameInvitation;
    }),

  // Принять приглашение
  accept: protectedProcedure
    .input(
      z.object({
        invitation_id: zUuid,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Получить приглашение
      const { data: invitation, error: fetchError } = await ctx.supabase
        .from("game_invitations")
        .select("*")
        .eq("id", input.invitation_id)
        .single();

      if (fetchError || !invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      const invitationData = invitation as GameInvitation;

      // Проверка что текущий пользователь - получатель приглашения
      if (invitationData.invitee_id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the recipient of this invitation",
        });
      }

      // Проверка статуса
      if (invitationData.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation is not pending",
        });
      }

      // Обновить статус приглашения
      const { data: updatedInvitation, error: updateError } = await ctx.supabase
        .from("game_invitations")
        .update({
          status: "accepted",
          responded_at: new Date().toISOString(),
        } as never)
        .eq("id", input.invitation_id)
        .select()
        .single();

      if (updateError || !updatedInvitation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to accept invitation",
          cause: updateError,
        });
      }

      // Обновить статус игры на DRAFT после принятия приглашения
      await ctx.supabase
        .from("games")
        .update({ status: GAME_STATUS.DRAFT } as never)
        .eq("id", invitationData.game_id);

      if (!invitationData.session_id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation is not linked to a session",
        });
      }

      const { error: sessionUpdateError } = await ctx.supabase
        .from("sessions")
        .update({ status: SESSION_STATUS.DRAFT } as never)
        .eq("id", invitationData.session_id)
        .select("id")
        .single();

      if (sessionUpdateError) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update session status after accepting invitation",
          cause: sessionUpdateError,
        });
      }

      return updatedInvitation as GameInvitation;
    }),

  // Отклонить приглашение
  reject: protectedProcedure
    .input(
      z.object({
        invitation_id: zUuid,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Получить приглашение
      const { data: invitation, error: fetchError } = await ctx.supabase
        .from("game_invitations")
        .select("*")
        .eq("id", input.invitation_id)
        .single();

      if (fetchError || !invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      const invitationData = invitation as GameInvitation;

      // Проверка что текущий пользователь - получатель приглашения
      if (invitationData.invitee_id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the recipient of this invitation",
        });
      }

      // Проверка статуса
      if (invitationData.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation is not pending",
        });
      }

      // Обновить статус приглашения
      const { data: updatedInvitation, error: updateError } = await ctx.supabase
        .from("game_invitations")
        .update({
          status: "rejected",
          responded_at: new Date().toISOString(),
        } as never)
        .eq("id", input.invitation_id)
        .select()
        .single();

      if (updateError || !updatedInvitation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to reject invitation",
          cause: updateError,
        });
      }

      // Вернуть игру в доступное состояние
      await ctx.supabase
        .from("games")
        .update({ status: "available" } as never)
        .eq("id", invitationData.game_id);

      return updatedInvitation as GameInvitation;
    }),

  // Отменить приглашение (для отправителя)
  cancel: protectedProcedure
    .input(
      z.object({
        invitation_id: zUuid,
      })
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      // Получить приглашение
      const { data: invitation, error: fetchError } = await ctx.supabase
        .from("game_invitations")
        .select("*")
        .eq("id", input.invitation_id)
        .single();

      if (fetchError || !invitation) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Invitation not found",
        });
      }

      const invitationData = invitation as GameInvitation;

      // Проверка что текущий пользователь - отправитель приглашения
      if (invitationData.inviter_id !== userId) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "You are not the sender of this invitation",
        });
      }

      // Проверка статуса
      if (invitationData.status !== "pending") {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invitation is not pending",
        });
      }

      // Обновить статус приглашения
      const { data: updatedInvitation, error: updateError } = await ctx.supabase
        .from("game_invitations")
        .update({
          status: "cancelled",
          responded_at: new Date().toISOString(),
        } as never)
        .eq("id", input.invitation_id)
        .select()
        .single();

      if (updateError || !updatedInvitation) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to cancel invitation",
          cause: updateError,
        });
      }

      return updatedInvitation as GameInvitation;
    }),

  // Получить приглашения для текущего пользователя
  getMyInvitations: protectedProcedure
    .input(
      z.object({
        status: z.enum(["pending", "accepted", "rejected", "cancelled", "expired"]).optional(),
      })
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.session.user.id;

      let query = ctx.supabase
        .from("game_invitations")
        .select("*")
        .or(`inviter_id.eq.${userId},invitee_id.eq.${userId}`)
        .order("created_at", { ascending: false });

      if (input.status) {
        query = query.eq("status", input.status);
      }

      const { data: invitations, error } = await query;

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch invitations",
          cause: error,
        });
      }

      return (invitations ?? []) as GameInvitation[];
    }),

  // Получить приглашение по game_id
  getByGameId: protectedProcedure
    .input(
      z.object({
        game_id: zUuid,
      })
    )
    .query(async ({ ctx, input }) => {
      const { data: invitation, error } = await ctx.supabase
        .from("game_invitations")
        .select("*")
        .eq("game_id", input.game_id)
        .eq("status", "pending")
        .maybeSingle();

      if (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch invitation",
          cause: error,
        });
      }

      return invitation as GameInvitation | null;
    }),
});

