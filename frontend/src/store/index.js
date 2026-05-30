import { create } from 'zustand';

const useStore = create((set) => ({
  // Events
  events: [],
  setEvents: (arr) => set({ events: arr }),

  // News
  news: [],
  addNews: (items) => set((state) => {
    const existing = new Set(state.news.map((n) => n.headline));
    const fresh = items.filter((n) => !existing.has(n.headline));
    return { news: [...fresh, ...state.news].slice(0, 300) };
  }),
  newsFilter: 'all',
  setFilter: (cat) => set({ newsFilter: cat }),

  // Layers
  layers: {
    conflict: true,
    alerts: true,
    military: true,
    nuclear: true,
    energy: false,
    sanctions: false,
  },
  toggleLayer: (id) =>
    set((state) => ({
      layers: { ...state.layers, [id]: !state.layers[id] },
    })),

  // View
  is3D: false,
  setIs3D: (bool) => set({ is3D: bool }),

  // Region
  currentRegion: 'WORLD',
  setRegion: (name) => set({ currentRegion: name }),

  // DEFCON
  defcon: 5,
  setDefcon: (n) => set({ defcon: n }),

  // Markets
  marketData: [],
  setMarketData: (arr) => set({ marketData: arr }),

  // Search
  searchQuery: '',
  setSearchQuery: (q) => set({ searchQuery: q }),
}));

export default useStore;
