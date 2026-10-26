// Enum for price ranges with fun labels
export enum PriceRangeEnum {
    BUDGET = 'budget',
    MODERATE = 'moderate',
    LUXURY = 'luxury',
}

export const getPriceLabel = (price: number | null): { label: string; color: string; icon: string } => {
    if (price === null || price === undefined) return { label: 'N/A', color: 'default', icon: 'fa-question' };

    if (price === 0) {
        return { label: 'Free 🆓', color: 'green', icon: 'fa-gift' };
    } else if (price < 50000) {
        return { label: 'Cạn Ví', color: 'cyan', icon: 'fa-piggy-bank' };
    } else if (price < 200000) {
        return { label: 'Vừa Túi', color: 'blue', icon: 'fa-wallet' };
    } else {
        return { label: 'Lút Su Rì', color: 'purple', icon: 'fa-gem' };
    }
};
