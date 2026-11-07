import React from "react";
import { Place } from "../PublicPlacesStore";

const StatusBadge = ({ status }: { status: Place["status"] }) => {
    const config = {
        open: {
            text: "Mở cửa",
            bgColor: "bg-green-50",
            textColor: "text-green-700",
            borderColor: "border-green-200",
        },
        coming: {
            text: "Sắp mở",
            bgColor: "bg-primary-50",
            textColor: "text-primary-700",
            borderColor: "border-primary-200",
        },
        closed: {
            text: "Tạm đóng",
            bgColor: "bg-red-50",
            textColor: "text-red-700",
            borderColor: "border-red-200",
        },
    };

    const { text, bgColor, textColor, borderColor } = config[status] || config.closed;

    return (
        <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${bgColor} ${textColor} ${borderColor} border transition-all duration-200`}
        >
            {text}
        </span>
    );
};

export default StatusBadge;
