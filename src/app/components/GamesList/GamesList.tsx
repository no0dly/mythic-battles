'use client'

import { useTranslation } from 'react-i18next'
import { api } from '@/trpc/client'
import Loader from '@/components/Loader'
import { Accordion } from '@/components/ui/accordion-1'
import { GameItem } from './components'
import { FileText } from 'lucide-react'

interface GamesListProps {
  sessionId: string
  player1Id: string
  player2Id: string
  player1Name: string
  player2Name: string
}

export const GamesList = ({
  sessionId,
  player1Id,
  player2Id,
  player1Name,
  player2Name,
}: GamesListProps) => {
  const { t } = useTranslation()

  const { data: games, isLoading, error } = api.games.getBySessionId.useQuery({
    sessionId,
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader />
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg border-2 border-red-200 bg-red-50 p-6 text-center shadow-sm">
        <div className="mb-2 text-lg font-semibold text-red-800">
          {t('errorLoadingGames')}
        </div>
        <div className="text-sm text-red-600">{error.message}</div>
      </div>
    )
  }

  if (!games || games.length === 0) {
    return (
      <div className="rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 p-8 text-center shadow-sm">
        <div className="text-gray-400 mb-2">
          <svg 
            className="mx-auto h-12 w-12" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={1.5} 
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" 
            />
          </svg>
        </div>
        <p className="text-lg font-medium text-gray-600">{t('noGamesYet')}</p>
        <p className="mt-1 text-sm text-gray-500">
          {t('gamesWillAppearHere')}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-gray-700">
            {t('showingGames', { count: games.length })}
          </span>
        </div>
      </div>

      <Accordion type="single" collapsible variant="outline" className="space-y-2">
        {games.map((game, index) => (
          <GameItem
            key={game.id}
            game={game}
            player1Id={player1Id}
            player1Name={player1Name}
            player2Name={player2Name}
            index={index}
          />
        ))}
      </Accordion>
    </div>
  )
}

