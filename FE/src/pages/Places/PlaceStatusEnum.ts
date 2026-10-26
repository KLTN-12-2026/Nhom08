// Frontend enum for place status (mirrors backend PlaceStatusEnum)
export enum PlaceStatusEnum {
    WAITING = 0,
    APPROVED = 1,
    REJECTED = 2,
}

// Human‑readable labels for each status
export const PlaceStatusLabels: Record<PlaceStatusEnum, string> = {
    [PlaceStatusEnum.WAITING]: 'Waiting for approval',
    [PlaceStatusEnum.APPROVED]: 'Approved',
    [PlaceStatusEnum.REJECTED]: 'Rejected',
};

/**
 * Helper to get label from status value (number or enum).
 */
export const getPlaceStatusLabel = (status: number | PlaceStatusEnum): string => {
    return PlaceStatusLabels[status as PlaceStatusEnum] ?? 'Unknown';
};
