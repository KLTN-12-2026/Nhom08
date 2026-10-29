import provinces from "../data/provinces/province.json";

export const getProvinceName = (code: string | number) => {
    const key = String(code);
    return (provinces as Record<string, any>)[key]?.name_with_type || "Không xác định";
};

