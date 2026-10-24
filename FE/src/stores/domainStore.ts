import { create } from "zustand";

const DOMAINS = {
  local: "http://127.0.0.1:8000/api",
  dev: "https://bedev.trove.id.vn/api",
  production: "https://main.be.trove.id.vn/api",
};

const STORAGE_KEY = "api-domain-preference";

interface DomainStoreState {
  currentDomain: string;
  setCurrentDomain: (domain: string) => void;
  switchDomain: (domain: string) => void;
  getDomainLabel: () => string;
  getDomainColor: () => string;
  getDomainIcon: () => string;
  getDomainURL: () => string;
  toggleDomain: () => void;
  initializeDomain: () => void;
}

const useDomainStore = create<DomainStoreState>((set, get) => ({
  currentDomain: "local",

  initializeDomain: () => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved || !["local", "dev", "production"].includes(saved)) {
        localStorage.setItem(STORAGE_KEY, "local");
        localStorage.setItem("api-base-url", DOMAINS.local);
        set({ currentDomain: "local" });
      } else {
        set({ currentDomain: saved });
        localStorage.setItem("api-base-url", DOMAINS[saved as keyof typeof DOMAINS]);
      }
    }
  },

  setCurrentDomain: (domain: string) => {
    if (["local", "dev", "production"].includes(domain)) {
      set({ currentDomain: domain });
      localStorage.setItem(STORAGE_KEY, domain);
      localStorage.setItem("api-base-url", DOMAINS[domain as keyof typeof DOMAINS]);
    }
  },

  switchDomain: (domain: string) => {
    if (["local", "dev", "production"].includes(domain)) {
      get().setCurrentDomain(domain);
      window.location.reload();
    }
  },

  getDomainLabel: () => {
    const { currentDomain } = get();
    const labels = {
      local: "Local",
      dev: "Dev",
      production: "Prod",
    };
    return labels[currentDomain as keyof typeof labels] || "Unknown";
  },

  getDomainColor: () => {
    const { currentDomain } = get();
    const colors = {
      local: "#fa8c16", // Orange
      dev: "#1890ff", // Blue
      production: "#52c41a", // Green
    };
    return colors[currentDomain as keyof typeof colors] || "#fa8c16";
  },

  getDomainIcon: () => {
    const { currentDomain } = get();
    const icons = {
      local: "fa-server",
      dev: "fa-code-branch",
      production: "fa-cloud",
    };
    return icons[currentDomain as keyof typeof icons] || "fa-server";
  },

  getDomainURL: () => {
    const { currentDomain } = get();
    return DOMAINS[currentDomain as keyof typeof DOMAINS] || DOMAINS.local;
  },

  toggleDomain: () => {
    const { currentDomain } = get();
    const domainOrder: Array<keyof typeof DOMAINS> = ["local", "dev", "production"];
    const currentIndex = domainOrder.indexOf(currentDomain as keyof typeof DOMAINS);
    const nextIndex = (currentIndex + 1) % domainOrder.length;
    const newDomain = domainOrder[nextIndex];
    
    get().setCurrentDomain(newDomain);
    // Reload để áp dụng domain mới
    window.location.reload();
  },
}));

export default useDomainStore;
export { DOMAINS, STORAGE_KEY };
