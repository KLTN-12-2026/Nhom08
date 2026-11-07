import { create } from "zustand";
import { message } from "antd";
import { RepositoryManager } from "../../data/repositoryManager";
import useActivityGroupsStore, { ActivityGroup } from "../ActivityGroups/ActivityGroupsStore.ts";
import usePlacesStore from "../Places/PlacesStore.ts";
import useDomainStore from "../../stores/domainStore.ts";

export interface Place {
  id: number | string;
  name: string;
  description: string | null;
  status: "open" | "coming" | "closed";
  category: string;
  address: string;
  image?: string;
  rating?: number;
  images?: string[];
  average_rating?: number;
  average_price?: number;
  activity_groups?: Array<{ id: number; name: string; key: string }>;
  is_favorited?: boolean;
}

export interface ApiPlace {
  id: number;
  name: string;
  description: string | null;
  status: number;
  address: string;
  average_rating: number;
  rating: number;
  average_price?: number;
  activity_groups?: Array<{ id: number; name: string; key: string }>;
  media?: Array<{ id?: number; url: string; type?: string }>;
  images?: string[];
  categories?: Array<{ id: number; name: string; display_name: string }>;
  user?: { id: number; name: string; avatar: string;[key: string]: any };
  reviews?: Array<{ id: number; rating: number; comment: string | null; created_at: string; user?: { name: string; avatar: string } }>;
  is_favorited?: boolean;
}

// Map API status (number) to UI status
const mapStatus = (status: number): Place["status"] => {
  // Status 1 = approved/open, 0 = pending/coming, -1 = rejected/closed
  if (status === 1) return "open";
  if (status === 0) return "coming";
  return "closed";
};

// Transform API place to UI place
const transformPlace = (apiPlace: ApiPlace): Place => {
  const category =
    apiPlace.activity_groups && apiPlace.activity_groups.length > 0
      ? apiPlace.activity_groups[0].name
      : "Khác";

  const images = apiPlace.media?.map((m) => m.url) || apiPlace.images || [];
  const mainImage = images[0];

  return {
    id: apiPlace.id,
    name: apiPlace.name,
    description: apiPlace.description || "Không có mô tả",
    status: mapStatus(apiPlace.status),
    category,
    address: apiPlace.address || "Chưa có địa chỉ",
    image: mainImage,
    images,
    rating: apiPlace.average_rating || apiPlace.rating || 0,
    average_price: apiPlace.average_price,
    activity_groups: apiPlace.activity_groups,
    is_favorited: apiPlace.is_favorited,
  };
};

interface PublicPlacesStoreState {
  // Places state
  places: Place[];
  isLoading: boolean;
  isLoadingMore: boolean;
  error: string | null;
  currentPage: number;
  hasMore: boolean;
  total: number;
  perPage: number;

  // Activity groups state
  activityGroups: ActivityGroup[];
  isLoadingGroups: boolean;

  // Modal state
  isCreateTripModalOpen: boolean;
  isPlaceModalOpen: boolean;
  selectedPlace: Place | null;
  placeDetail: any | null;
  isLoadingPlaceDetail: boolean;

  // UI state
  isHeaderVisible: boolean;
  lastScrollY: number;
  domainClickCount: number;

  filterParams: any;

  // Actions
  fetchPlaces: (page: number, append?: boolean, filterParams?: any) => Promise<void>;
  fetchActivityGroups: () => Promise<void>;
  handleLoadMore: () => void;
  handleCreateTrip: (values: any) => Promise<void>;
  openPlaceDetail: (place: Place) => Promise<void>;
  closePlaceDetail: () => void;
  setCreateTripModalOpen: (open: boolean) => void;
  setHeaderVisible: (visible: boolean) => void;
  setLastScrollY: (scrollY: number) => void;
  handleVersionClick: () => void;
  resetDomainClickCount: () => void;
}

const usePublicPlacesStore = create<PublicPlacesStoreState>((set, get) => ({
  // Initial state
  places: [],
  isLoading: true,
  isLoadingMore: false,
  error: null,
  currentPage: 1,
  hasMore: false,
  total: 0,
  perPage: 12,
  filterParams: {},

  activityGroups: [],
  isLoadingGroups: false,

  isCreateTripModalOpen: false,
  isPlaceModalOpen: false,
  selectedPlace: null,
  placeDetail: null,
  isLoadingPlaceDetail: false,

  isHeaderVisible: true,
  lastScrollY: 0,
  domainClickCount: 0,

  fetchPlaces: async (page: number, append: boolean = false, filterParams: any = null) => {
    const { perPage } = get();
    try {
      if (append) {
        set({ isLoadingMore: true });
      } else {
        set({ isLoading: true, error: null });
      }

      const activeFilters = filterParams !== null ? filterParams : get().filterParams;
      if (filterParams !== null) {
        set({ filterParams });
      }

      const params = {
        per_page: perPage,
        page: page,
        ...activeFilters,
      };

      const result = await RepositoryManager.places.getPublicPlaces(params);

      let newPlaces: Place[] = [];

      // API returns response.data directly, which should have data array
      if (result && result.data && Array.isArray(result.data)) {
        newPlaces = result.data.map((apiPlace: ApiPlace) =>
          transformPlace(apiPlace)
        );
        set({
          hasMore: result.data.length === perPage,
          total: result.total || result.data.length,
        });
      } else if (result && result.data && result.data.data && Array.isArray(result.data.data)) {
        // Handle paginated response format
        newPlaces = result.data.data.map((apiPlace: ApiPlace) =>
          transformPlace(apiPlace)
        );
        const totalPages = result.data.last_page || Math.ceil((result.data.total || 0) / perPage);
        set({
          hasMore: page < totalPages,
          total: result.data.total || 0,
        });
      } else {
        set({ hasMore: false });
      }

      if (append) {
        set((state) => ({ places: [...state.places, ...newPlaces] }));
      } else {
        set({ places: newPlaces, currentPage: page });
      }
    } catch (err: any) {
      // Handle 401 gracefully - don't show error, just empty state
      // This is a public page, so 401 is expected if not logged in
      if (err?.response?.status === 401 || err?.message?.includes("401") || err?.message?.includes("Unauthorized")) {
        if (!append) {
          set({ places: [], error: null });
        }
        set({ hasMore: false });
      } else {
        const errorMessage =
          err instanceof Error ? err.message : "Đã xảy ra lỗi không xác định";
        if (!append) {
          set({ error: errorMessage });
        }
      }
    } finally {
      set({ isLoading: false, isLoadingMore: false });
    }
  },

  fetchActivityGroups: async () => {
    set({ isLoadingGroups: true });
    try {
      const { getGroups } = useActivityGroupsStore.getState();
      const result = await getGroups({ per_page: 20, page: 1 });
      if (result.success && result.data) {
        // Filter only active groups
        const activeGroups = result.data.data.filter((group: ActivityGroup) => group.is_active);
        set({ activityGroups: activeGroups });
      }
    } catch (err) {
      console.error("Failed to load activity groups:", err);
    } finally {
      set({ isLoadingGroups: false });
    }
  },

  handleLoadMore: () => {
    const { isLoadingMore, hasMore, currentPage, fetchPlaces } = get();
    if (!isLoadingMore && hasMore) {
      const nextPage = currentPage + 1;
      set({ currentPage: nextPage });
      fetchPlaces(nextPage, true);
    }
  },

  handleCreateTrip: async (values: any) => {
    try {
      const { createPlace } = usePlacesStore.getState();
      const result = await createPlace(values);

      if (result.success) {
        message.success("Đăng địa điểm thành công!");
        set({ isCreateTripModalOpen: false });
        
        // Add the newly created place to global posts store so it immediately shows up in 'My Posts'
        try {
          const useDataMainStore = (await import("../../stores/dataMainStore.js")).default;
          const { addPost } = useDataMainStore.getState();
          const createdData = result.data as any;
          
          if (createdData) {
            const newPost = {
              id: createdData.id || Date.now(),
              title: createdData.name || "Địa điểm mới",
              category: (createdData.activity_groups && createdData.activity_groups.length > 0)
                ? (createdData.activity_groups[0].name || "Địa điểm")
                : (createdData.categories && createdData.categories.length > 0)
                ? (createdData.categories[0].display_name || "Địa điểm")
                : "Địa điểm",
              status: "pending",
              date: new Date().toISOString().split("T")[0],
              image: (createdData.media && createdData.media.length > 0)
                ? createdData.media[0].url
                : "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?auto=format&fit=crop&w=500&q=80",
              description: createdData.description || "Chưa có mô tả chi tiết."
            };
            addPost(newPost);
          }
        } catch (e) {
          console.error("Failed to dynamically add post to user store:", e);
        }

        // Refresh places list
        get().fetchPlaces(1, false);
      } else {
        message.error(result.error || "Không thể Đăng địa điểm");
      }
    } catch (err) {
      console.error("Error creating trip:", err);
    }
  },

  openPlaceDetail: async (place: Place) => {
    set({
      selectedPlace: place,
      isPlaceModalOpen: true,
      isLoadingPlaceDetail: true,
      placeDetail: null,
    });

    try {
      const result = await RepositoryManager.places.getPlaceById(place.id);
      if (result.success && result.data) {
        // Transform API response to match Place interface
        const apiPlace = result.data.data || result.data;
        const transformedPlace = transformPlace(apiPlace);
        set({
          placeDetail: {
            ...transformedPlace,
            // Include additional fields from API
            average_price: apiPlace.average_price,
            contact_email: apiPlace.contact_email,
            contact_phone: apiPlace.contact_phone,
            reviews_count: apiPlace.reviews_count,
            latitude: apiPlace.latitude,
            longitude: apiPlace.longitude,
            tags: apiPlace.tags || [],
            media: apiPlace.media || [],
            categories: apiPlace.categories || [],
            user: apiPlace.user,
            reviews: apiPlace.reviews || [],
            is_favorited: apiPlace.is_favorited || transformedPlace.is_favorited,
          },
        });
      }
    } catch (err: any) {
      console.error("Error loading place detail:", err);
      // Keep showing basic place info even if detail fails
      set({ placeDetail: null });
    } finally {
      set({ isLoadingPlaceDetail: false });
    }
  },

  closePlaceDetail: () => {
    set({
      isPlaceModalOpen: false,
      selectedPlace: null,
      placeDetail: null,
    });
  },

  setCreateTripModalOpen: (open: boolean) => {
    set({ isCreateTripModalOpen: open });
  },

  setHeaderVisible: (visible: boolean) => {
    set({ isHeaderVisible: visible });
  },

  setLastScrollY: (scrollY: number) => {
    set({ lastScrollY: scrollY });
  },

  handleVersionClick: () => {
    const { domainClickCount } = get();
    const newCount = domainClickCount + 1;
    set({ domainClickCount: newCount });

    if (newCount >= 10) {
      // Reset counter
      set({ domainClickCount: 0 });

      // Switch domain logic - sử dụng domainStore
      useDomainStore.getState().toggleDomain();
    }
  },

  resetDomainClickCount: () => {
    set({ domainClickCount: 0 });
  },
}));

export default usePublicPlacesStore;
export { mapStatus, transformPlace };

