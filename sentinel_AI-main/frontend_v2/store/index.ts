import { create } from 'zustand'

interface AppState {
  sidebarOpen: boolean
  sidebarCollapsed: boolean
  mobileDrawerOpen: boolean
  commandPaletteOpen: boolean
  notificationsOpen: boolean
  toggleSidebar: () => void
  toggleSidebarCollapse: () => void
  toggleMobileDrawer: () => void
  toggleCommandPalette: () => void
  toggleNotifications: () => void
  closeMobileDrawer: () => void
  closeCommandPalette: () => void
  closeNotifications: () => void
}

export const useAppStore = create<AppState>((set) => ({
  sidebarOpen: true,
  sidebarCollapsed: false,
  mobileDrawerOpen: false,
  commandPaletteOpen: false,
  notificationsOpen: false,
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  toggleSidebarCollapse: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  toggleMobileDrawer: () => set((s) => ({ mobileDrawerOpen: !s.mobileDrawerOpen })),
  toggleCommandPalette: () => set((s) => ({ commandPaletteOpen: !s.commandPaletteOpen })),
  toggleNotifications: () => set((s) => ({ notificationsOpen: !s.notificationsOpen })),
  closeMobileDrawer: () => set({ mobileDrawerOpen: false }),
  closeCommandPalette: () => set({ commandPaletteOpen: false }),
  closeNotifications: () => set({ notificationsOpen: false }),
}))
