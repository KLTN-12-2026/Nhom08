import React from 'react';
import { Button, Tag, Rate, Image, Space, Popconfirm, Switch } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { Place } from '../PlacesStore';
import { PlaceStatusEnum, getPlaceStatusLabel } from '../PlaceStatusEnum';
import { getPriceLabel } from '../PriceRangeEnum';

interface GetColumnsParams {
    handleEditPlace: (id: number) => void;
    handleDeletePlace: (id: number) => void;
    handleQuickApprove: (id: number, checked: boolean) => void;
}

export const getPlaceColumns = ({
    handleEditPlace,
    handleDeletePlace,
    handleQuickApprove,
}: GetColumnsParams): ColumnsType<Place> => [
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-location-dot text-black"></i>
                    <span className="font-semibold">Place Info</span>
                </span>
            ),
            key: "place_info",
            width: 300,
            render: (_, record) => (
                <div className="flex items-start gap-3">
                    {record.images && record.images.length > 0 ? (
                        <Image
                            src={record.images[0]}
                            alt={record.name}
                            width={60}
                            height={60}
                            className="rounded-xl object-cover"
                            preview={false}
                        />
                    ) : (
                        <div className="w-[60px] h-[60px] rounded-xl bg-gradient-to-br from-yellow-100 to-yellow-200 flex items-center justify-center">
                            <i className="fa-solid fa-image text-primary-600 text-2xl"></i>
                        </div>
                    )}
                    <div className="flex-1">
                        <div className="font-semibold text-gray-900">{record.name}</div>
                        <div className="text-gray-500 text-xs flex items-center gap-1 mt-1">
                            <i className="fa-solid fa-map-marker-alt text-xs"></i>
                            {record.address}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                            <Rate disabled value={record.rating} className="text-xs" />
                            <span className="text-xs text-gray-500">({record.reviews_count})</span>
                        </div>
                    </div>
                </div>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-layer-group text-black"></i>
                    <span className="font-semibold">Activity Groups</span>
                </span>
            ),
            key: "activity_groups",
            render: (_, record) => (
                <div className="flex flex-wrap gap-1">
                    {record.activity_groups && record.activity_groups.length > 0 ? (
                        record.activity_groups.map((group) => (
                            <Tag key={group.id} color="purple">
                                {group.name}
                            </Tag>
                        ))
                    ) : (
                        <span className="text-gray-400 text-xs">No groups</span>
                    )}
                </div>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-tag text-black"></i>
                    <span className="font-semibold">Price</span>
                </span>
            ),
            dataIndex: "average_price",
            key: "average_price",
            render: (price) => {
                const { label, color, icon } = getPriceLabel(price);
                return (
                    <Tag color={color} className="rounded-full px-3 py-1 border-0 font-medium text-sm flex items-center w-fit gap-2">
                        <i className={`fa-solid ${icon}`}></i>
                        {label}
                    </Tag>
                );
            },
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-user text-black"></i>
                    <span className="font-semibold">Owner</span>
                </span>
            ),
            key: "user",
            render: (_, record) => (
                <div>
                    {record.user ? (
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-xs">
                                {record.user.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <div className="text-sm font-semibold text-gray-900">{record.user.name}</div>
                                <div className="text-xs text-gray-500">{record.user.email}</div>
                            </div>
                        </div>
                    ) : (
                        <Tag color="default">Unknown User</Tag>
                    )}
                </div>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-black"></i>
                    <span className="font-semibold">Status</span>
                </span>
            ),
            key: "status",
            render: (_, record) => {
                const isApproved = record.status === PlaceStatusEnum.APPROVED;
                const isRejected = record.status === PlaceStatusEnum.REJECTED;
                const isWaiting = record.status === PlaceStatusEnum.WAITING;

                return (
                    <div className={`
                    flex items-center justify-between gap-2 px-3 py-1.5 rounded-full border transition-all duration-200
                    ${isApproved ? 'bg-green-50 border-green-200' : isRejected ? 'bg-red-50 border-red-200' : 'bg-orange-50 border-orange-200'}
                `}>
                        <span className={`text-xs font-semibold ${isApproved ? 'text-green-700' : isRejected ? 'text-red-700' : 'text-orange-700'}`}>
                            {getPlaceStatusLabel(record.status)}
                        </span>
                        <Switch
                            checked={isApproved}
                            onChange={(checked) => handleQuickApprove(record.id, checked)}
                            size="small"
                            className={isApproved ? "bg-green-500" : "bg-gray-300"}
                        />
                    </div>
                );
            },
        },
        {
            title: <span className="font-semibold">Actions</span>,
            key: "action",
            align: "center",
            width: 160,
            render: (_, record) => (
                <Space>
                    <Button
                        icon={<i className="fa-solid fa-pen-to-square"></i>}
                        type="text"
                        className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
                        onClick={() => handleEditPlace(record.id)}
                    />
                    <Popconfirm
                        title="Delete this place?"
                        description="Are you sure to delete this place?"
                        onConfirm={() => handleDeletePlace(record.id)}
                        okText="Yes"
                        cancelText="No"
                    >
                        <Button
                            icon={<i className="fa-solid fa-trash"></i>}
                            type="text"
                            danger
                            className="hover:bg-red-50"
                        />
                    </Popconfirm>
                </Space>
            ),
        },
    ];
