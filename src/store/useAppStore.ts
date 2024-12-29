import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { uniqueCodeService } from '../services/uniqueCodeService';

interface CodeState {
  codes: any[];
  statistics: any;
  filters: {
    timeRange: 'week' | 'month' | 'year';
    prizeId?: number;
    isUsed?: boolean;
    page: number;
  };
  loading: boolean;
  error: string | null;
}

interface CodeActions {
  loadCodes: () => Promise<void>;
  loadStatistics: () => Promise<void>;
  generateCode: (prizeId: number) => Promise<any>;
  exportCodes: (options: any) => Promise<any>;
  updateFilters: (newFilters: Partial<CodeState['filters']>) => void;
  resetState: () => void;
}

interface ThemeState {
  darkMode: boolean;
  fontSize: 'small' | 'medium' | 'large';
  highContrast: boolean;
  reducedMotion: boolean;
}

interface ThemeActions {
  toggleDarkMode: () => void;
  setFontSize: (size: ThemeState['fontSize']) => void;
  toggleHighContrast: () => void;
  toggleReducedMotion: () => void;
  resetTheme: () => void;
}

interface UIState {
  sidebarOpen: boolean;
  modalOpen: string | null;
  notifications: Array<{
    id: string;
    type: 'success' | 'error' | 'info' | 'warning';
    message: string;
  }>;
}

interface UIActions {
  toggleSidebar: () => void;
  openModal: (modalId: string) => void;
  closeModal: () => void;
  addNotification: (type: UIState['notifications'][0]['type'], message: string) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

interface AppState extends CodeState, ThemeState, UIState {
  actions: CodeActions & ThemeActions & UIActions;
}

const initialState: Omit<AppState, 'actions'> = {
  // Code State
  codes: [],
  statistics: null,
  filters: {
    timeRange: 'week',
    page: 1,
  },
  loading: false,
  error: null,

  // Theme State
  darkMode: false,
  fontSize: 'medium',
  highContrast: false,
  reducedMotion: false,

  // UI State
  sidebarOpen: true,
  modalOpen: null,
  notifications: [],
};

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        actions: {
          // Code Actions
          loadCodes: async () => {
            const { filters } = get();
            set({ loading: true, error: null });

            try {
              const response = await uniqueCodeService.listCodes(filters);
              if (response.success) {
                set({ codes: response.data.codes });
              } else {
                set({ error: response.error || 'Error al cargar códigos' });
              }
            } catch (error) {
              set({ error: 'Error al cargar códigos' });
            } finally {
              set({ loading: false });
            }
          },

          loadStatistics: async () => {
            const { filters } = get();
            set({ loading: true, error: null });

            try {
              const response = await uniqueCodeService.getStatistics(filters.timeRange);
              if (response.success) {
                set({ statistics: response.data });
              } else {
                set({ error: response.error || 'Error al cargar estadísticas' });
              }
            } catch (error) {
              set({ error: 'Error al cargar estadísticas' });
            } finally {
              set({ loading: false });
            }
          },

          generateCode: async (prizeId: number) => {
            const { actions } = get();
            set({ loading: true, error: null });

            try {
              const response = await uniqueCodeService.generateCode(prizeId);
              if (response.success) {
                actions.loadCodes();
                actions.loadStatistics();
                actions.addNotification('success', 'Código generado exitosamente');
                return response.data;
              } else {
                set({ error: response.error || 'Error al generar código' });
                actions.addNotification('error', 'Error al generar código');
                return null;
              }
            } catch (error) {
              set({ error: 'Error al generar código' });
              actions.addNotification('error', 'Error al generar código');
              return null;
            } finally {
              set({ loading: false });
            }
          },

          exportCodes: async (options: any) => {
            const { actions } = get();
            set({ loading: true, error: null });

            try {
              const response = await uniqueCodeService.exportCodes(options);
              if (response.success) {
                actions.addNotification('success', 'Códigos exportados exitosamente');
                return response.data;
              } else {
                set({ error: response.error || 'Error al exportar códigos' });
                actions.addNotification('error', 'Error al exportar códigos');
                return null;
              }
            } catch (error) {
              set({ error: 'Error al exportar códigos' });
              actions.addNotification('error', 'Error al exportar códigos');
              return null;
            } finally {
              set({ loading: false });
            }
          },

          updateFilters: (newFilters) => {
            const { filters, actions } = get();
            set({
              filters: {
                ...filters,
                ...newFilters,
                page: newFilters.timeRange ? 1 : filters.page,
              },
            });
            actions.loadCodes();
            if (newFilters.timeRange) {
              actions.loadStatistics();
            }
          },

          resetState: () => {
            set({
              codes: [],
              statistics: null,
              filters: initialState.filters,
              loading: false,
              error: null,
            });
          },

          // Theme Actions
          toggleDarkMode: () => {
            const { darkMode } = get();
            set({ darkMode: !darkMode });
            document.documentElement.classList.toggle('dark', !darkMode);
          },

          setFontSize: (size) => {
            set({ fontSize: size });
            document.documentElement.setAttribute('data-font-size', size);
          },

          toggleHighContrast: () => {
            const { highContrast } = get();
            set({ highContrast: !highContrast });
            document.documentElement.classList.toggle('high-contrast', !highContrast);
          },

          toggleReducedMotion: () => {
            const { reducedMotion } = get();
            set({ reducedMotion: !reducedMotion });
            document.documentElement.classList.toggle('reduced-motion', !reducedMotion);
          },

          resetTheme: () => {
            set({
              darkMode: false,
              fontSize: 'medium',
              highContrast: false,
              reducedMotion: false,
            });
            document.documentElement.classList.remove('dark', 'high-contrast', 'reduced-motion');
            document.documentElement.setAttribute('data-font-size', 'medium');
          },

          // UI Actions
          toggleSidebar: () => {
            const { sidebarOpen } = get();
            set({ sidebarOpen: !sidebarOpen });
          },

          openModal: (modalId) => {
            set({ modalOpen: modalId });
          },

          closeModal: () => {
            set({ modalOpen: null });
          },

          addNotification: (type, message) => {
            const { notifications } = get();
            const id = Date.now().toString();
            set({
              notifications: [
                ...notifications,
                { id, type, message },
              ],
            });

            // Auto-remove after 5 seconds
            setTimeout(() => {
              get().actions.removeNotification(id);
            }, 5000);
          },

          removeNotification: (id) => {
            const { notifications } = get();
            set({
              notifications: notifications.filter(n => n.id !== id),
            });
          },

          clearNotifications: () => {
            set({ notifications: [] });
          },
        },
      }),
      {
        name: 'app-storage',
        partialize: (state) => ({
          darkMode: state.darkMode,
          fontSize: state.fontSize,
          highContrast: state.highContrast,
          reducedMotion: state.reducedMotion,
          sidebarOpen: state.sidebarOpen,
        }),
      }
    )
  )
);
