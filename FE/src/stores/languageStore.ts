import { create } from "zustand";
import { persist } from "zustand/middleware";

export type Language = "en" | "vn";

interface LanguageState {
    currentLanguage: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const translations = {
    en: require("../locales/en.json"),
    vn: require("../locales/vn.json"),
};

const useLanguageStore = create<LanguageState>()(
    persist(
        (set, get) => ({
            currentLanguage: "en",
            setLanguage: (lang) => set({ currentLanguage: lang }),
            t: (key: string) => {
                const lang = get().currentLanguage;
                const parts = key.split(".");
                let value: any = translations[lang];
                for (const part of parts) {
                    if (value && typeof value === "object") {
                        value = value[part];
                    } else {
                        return key;
                    }
                }
                return typeof value === "string" ? value : key;
            },
        }),
        { name: "language-store" }
    )
);

export default useLanguageStore;
