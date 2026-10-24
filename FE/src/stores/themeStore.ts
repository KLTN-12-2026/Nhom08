import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeStoreState {
    theme: 'light' | 'dark';
    toggleTheme: () => void;
    setTheme: (theme: 'light' | 'dark') => void;
}

const useThemeStore = create<ThemeStoreState>()(
    persist(
        (set, get) => ({
            theme: 'light',

            toggleTheme: () => {
                const newTheme = get().theme === 'light' ? 'dark' : 'light';
                set({ theme: newTheme });

                // Apply theme to document
                if (newTheme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            },

            setTheme: (theme: 'light' | 'dark') => {
                set({ theme });

                // Apply theme to document
                if (theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            },
        }),
        {
            name: 'trove-theme-storage',
            onRehydrateStorage: () => (state) => {
                // Apply theme on initial load
                if (state?.theme === 'dark') {
                    document.documentElement.classList.add('dark');
                } else {
                    document.documentElement.classList.remove('dark');
                }
            },
        }
    )
);

export default useThemeStore;
