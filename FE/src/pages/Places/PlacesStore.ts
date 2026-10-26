import { create } from "zustand";
import toast from "react-hot-toast";
import { RepositoryManager } from "../../data/repositoryManager";

export interface Place {
    id: number;
    user_id: number;
    name: string;
    address: string;
    latitude: number | null;
    longitude: number | null;
    description: string | null;
    average_price: number | null;
    contact_email: string | null;
    contact_phone: string | null;
    rating: number;
    average_rating: number;
    reviews_count: number;
    status: number;
    admin_notes: string | null;
    is_anonymous: boolean;
    is_favorited: boolean;
    tags: string[];
    activity_groups: ActivityGroup[];
    media: Media[];
    reviews: any[];
    created_at: string;
    updated_at: string;
    user?: {
        id: number;
        name: string;
        email: string;
    };
    // Computed properties for UI
    images?: string[];
    is_verified?: boolean;
    is_active?: boolean;
}

interface ActivityGroup {
    id: number;
    name: string;
    key: string;
}

interface Media {
    id?: number;
    url: string;
    type?: string;
}

interface PaginationLinks {
    url: string | null;
    label: string;
    page: number | null;
    active: boolean;
}

interface PlacesDataResponse {
    current_page: number;
    data: Place[];
    first_page_url: string;
    from: number;
    last_page: number;
    last_page_url: string;
    links: PaginationLinks[];
    next_page_url: string | null;
    path: string;
    per_page: number;
    prev_page_url: string | null;
    to: number;
    total: number;
}

interface PlaceDataResponse {
    data: Place;
}

interface PlacesStoreState {
    placesData: PlacesDataResponse | null;
    placeData: PlaceDataResponse | null;
    error: string | null;

    isListLoading: boolean;
    isDetailLoading: boolean;
    isSaving: boolean;
    isDeleting: boolean;

    getPlaces: (params?: any) => Promise<{ success: boolean; data?: PlacesDataResponse; error?: string }>;
    getPlaceById: (placeId: string | number) => Promise<{ success: boolean; data?: PlaceDataResponse; error?: string }>;
    createPlace: (payload: Partial<Place>) => Promise<{ success: boolean; data?: Place; error?: string }>;
    updatePlace: (placeId: string | number, payload: Partial<Place>) => Promise<{ success: boolean; data?: Place; error?: string }>;
    deletePlace: (placeId: string | number) => Promise<{ success: boolean; error?: string }>;
}

const usePlacesStore = create<PlacesStoreState>((set, get) => ({
    placesData: null,
    placeData: null,
    error: null,

    isListLoading: false,
    isDetailLoading: false,
    isSaving: false,
    isDeleting: false,

    getPlaces: async (params = {}) => {
        set({ isListLoading: true, error: null });
        try {
            const result = await RepositoryManager.places.getPlaces(params);
            if (result.success && result.data) {
                // Transform API response: data.data + pagination fields at data level
                const transformedData = {
                    current_page: result.data.current_page,
                    data: result.data.data.map((place: Place) => ({
                        ...place,
                        // Add computed properties for UI compatibility
                        images: place.media?.map((m) => m.url) || [],
                        is_verified: place.status === 1,
                        is_active: place.status === 1,
                    })),
                    first_page_url: "",
                    from: (result.data.current_page - 1) * result.data.per_page + 1,
                    last_page: result.data.last_page,
                    last_page_url: "",
                    links: [],
                    next_page_url: null,
                    path: "",
                    per_page: result.data.per_page,
                    prev_page_url: null,
                    to: result.data.current_page * result.data.per_page,
                    total: result.data.total,
                };
                set({ placesData: transformedData, isListLoading: false });
                return { success: true, data: transformedData };
            }
            throw new Error(result.message || "Failed to fetch places");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            set({ isListLoading: false, error: message });
            toast.error(message, { icon: "❌" });
            return { success: false, error: message };
        }
    },

    getPlaceById: async (placeId) => {
        set({ isDetailLoading: true, error: null });
        try {
            const result = await RepositoryManager.places.getPlaceById(placeId);
            if (result.success && result.data) {
                set({ placeData: { data: result.data }, isDetailLoading: false });
                return { success: true, data: { data: result.data } };
            }
            throw new Error(result.message || "Failed to fetch place details");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Unknown error";
            set({ isDetailLoading: false, error: message });
            toast.error(message, { icon: "❌" });
            return { success: false, error: message };
        }
    },

    createPlace: async (payload) => {
        set({ isSaving: true, error: null });
        try {
            const result = await RepositoryManager.places.createPlace(payload);
            if (result.success && result.data) {
                const newPlace = result.data as Place;
                const { placesData } = get();
                if (placesData) {
                    const newData = {
                        ...placesData,
                        data: [newPlace, ...placesData.data],
                        total: placesData.total + 1,
                    };
                    set({ placesData: newData });
                }
                toast.success("Place created successfully ✅");
                set({ isSaving: false });
                return { success: true, data: newPlace };
            }
            throw new Error(result.message || "Failed to create place");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error creating place";
            set({ isSaving: false, error: message });
            toast.error(message, { icon: "❌" });
            return { success: false, error: message };
        }
    },

    updatePlace: async (placeId, payload) => {
        set({ isSaving: true, error: null });
        try {
            const result = await RepositoryManager.places.updatePlace(placeId, payload);
            if (result.success && result.data) {
                const updatedPlace = result.data as Place;
                const { placesData } = get();
                if (placesData) {
                    const newData = {
                        ...placesData,
                        data: placesData.data.map((p) => (p.id === updatedPlace.id ? updatedPlace : p)),
                    };
                    set({ placesData: newData });
                }
                toast.success("Place updated successfully ✅");
                set({ isSaving: false });
                return { success: true, data: updatedPlace };
            }
            throw new Error(result.message || "Failed to update place");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error updating place";
            set({ isSaving: false, error: message });
            toast.error(message, { icon: "❌" });
            return { success: false, error: message };
        }
    },

    deletePlace: async (placeId) => {
        set({ isDeleting: true, error: null });
        try {
            const result = await RepositoryManager.places.deletePlace(placeId);
            if (result.success) {
                const { placesData } = get();
                if (placesData) {
                    set({
                        placesData: {
                            ...placesData,
                            data: placesData.data.filter((p) => p.id !== placeId),
                            total: placesData.total - 1,
                        },
                    });
                }
                toast.success("Place deleted successfully 🗑");
                set({ isDeleting: false });
                return { success: true };
            }
            throw new Error(result.message || "Failed to delete place");
        } catch (err) {
            const message = err instanceof Error ? err.message : "Error deleting place";
            set({ isDeleting: false, error: message });
            toast.error(message, { icon: "❌" });
            return { success: false, error: message };
        }
    },
}));

export default usePlacesStore;
