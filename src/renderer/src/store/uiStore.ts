import { create } from 'zustand'

type Page = 'home' | 'profiles' | 'settings' | 'about'

interface UiState {
  sidebarCollapsed: boolean
  currentPage: Page
  showOnboarding: boolean
  setSidebarCollapsed: (collapsed: boolean) => void
  setCurrentPage: (page: Page) => void
  setShowOnboarding: (show: boolean) => void
  toggleSidebar: () => void
}

export const useUiStore = create<UiState>((set) => ({
  sidebarCollapsed: false,
  currentPage: 'home',
  showOnboarding: false,

  setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setShowOnboarding: (show) => set({ showOnboarding: show }),
  toggleSidebar: () => set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed }))
}))
