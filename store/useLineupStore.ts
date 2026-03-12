import { create } from 'zustand'

export type PositionStr = string

export interface Player {
  id: string
  name: string
  number: number
  position: string
  photo: string
}

export interface LineupStore {
  selectedFormation: string
  setFormation: (formationId: string) => void
  placements: Record<PositionStr, Player | null>
  placePlayer: (positionId: string, player: Player) => void
  removePlayer: (positionId: string) => void
  clearLineup: () => void
  // Click-to-place
  selectedPlayer: Player | null
  selectPlayer: (player: Player | null) => void
}

export const useLineupStore = create<LineupStore>((set) => ({
  selectedFormation: '4-2-3-1',
  setFormation: (formationId) => set({ selectedFormation: formationId }),
  placements: {},
  placePlayer: (positionId, player) =>
    set((state) => {
      const newPlacements = { ...state.placements }
      // Remove player from any existing position
      Object.keys(newPlacements).forEach((key) => {
        if (newPlacements[key]?.id === player.id) {
          newPlacements[key] = null
        }
      })
      newPlacements[positionId] = player
      return { placements: newPlacements, selectedPlayer: null }
    }),
  removePlayer: (positionId) =>
    set((state) => ({
      placements: { ...state.placements, [positionId]: null },
    })),
  clearLineup: () => set({ placements: {}, selectedPlayer: null }),
  // Click-to-place
  selectedPlayer: null,
  selectPlayer: (player) => set({ selectedPlayer: player }),
}))
