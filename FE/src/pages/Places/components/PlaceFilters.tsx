import React from 'react';
import { Input, Select, Checkbox, InputNumber, DatePicker, Button } from 'antd';
import { PlaceStatusEnum } from '../PlaceStatusEnum';

interface PlaceFiltersProps {
    searchText: string;
    filterCategories: number[];
    filterActivityGroups: number[];
    filterStatus: number[];
    priceMin: number | undefined;
    priceMax: number | undefined;
    distanceKm: number | undefined;
    categoryOptions: Array<{ id: number; name: string }>;
    activityGroupOptions: Array<{ id: number; name: string }>;
    selectedRowKeys: React.Key[];
    isBulkApproving: boolean;
    onSearch: (value: string) => void;
    setFilterCategories: (value: number[]) => void;
    setFilterActivityGroups: (value: number[]) => void;
    setFilterStatus: (value: number[]) => void;
    setPriceMin: (value: number | undefined) => void;
    setPriceMax: (value: number | undefined) => void;
    setDistanceKm: (value: number | undefined) => void;
    setCreatedFrom: (value: string | undefined) => void;
    setCreatedTo: (value: string | undefined) => void;
    setSelectedRowKeys: (keys: React.Key[]) => void;
    handleLoadCategories: (open: boolean) => void;
    handleLoadActivityGroups: (open: boolean) => void;
    handleBulkApprove: () => void;
    handleBulkReject: () => void;
    onAddPlace: () => void;
}

const PlaceFilters: React.FC<PlaceFiltersProps> = ({
    searchText,
    filterCategories,
    filterActivityGroups,
    filterStatus,
    priceMin,
    priceMax,
    distanceKm,
    categoryOptions,
    activityGroupOptions,
    selectedRowKeys,
    isBulkApproving,
    onSearch,
    setFilterCategories,
    setFilterActivityGroups,
    setFilterStatus,
    setPriceMin,
    setPriceMax,
    setDistanceKm,
    setCreatedFrom,
    setCreatedTo,
    setSelectedRowKeys,
    handleLoadCategories,
    handleLoadActivityGroups,
    handleBulkApprove,
    handleBulkReject,
    onAddPlace,
}) => {
    return (
        <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3 flex-wrap mb-4">
                {/* Bulk Actions */}
                {selectedRowKeys.length > 0 && (
                    <div className="flex items-center gap-2 px-3 py-1.5 bg-primary-50 rounded-lg border border-primary-200">
                        <span className="text-sm font-medium text-primary-700">
                            Đã chọn: {selectedRowKeys.length}
                        </span>
                        <Button
                            type="primary"
                            size="small"
                            icon={<i className="fa-solid fa-check text-black"></i>}
                            onClick={handleBulkApprove}
                            loading={isBulkApproving}
                            className="bg-green-500 hover:bg-green-600 border-none"
                        >
                            Approve
                        </Button>
                        <Button
                            size="small"
                            danger
                            icon={<i className="fa-solid fa-times"></i>}
                            onClick={handleBulkReject}
                            loading={isBulkApproving}
                        >
                            Reject
                        </Button>
                        <Button
                            size="small"
                            type="text"
                            onClick={() => setSelectedRowKeys([])}
                        >
                            Bỏ chọn
                        </Button>
                    </div>
                )}

                {/* Add New Place button */}
                <Button
                    type="primary"
                    icon={<i className="fa-solid fa-plus text-black"></i>}
                    className="shadow-lg shadow-yellow-200/50"
                    onClick={onAddPlace}
                >
                    Add New Place
                </Button>
            </div>

            <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <Input.Search
                    placeholder="Search places..."
                    onSearch={onSearch}
                    style={{ width: 250 }}
                    className="rounded-xl"
                    prefix={<i className="fa-solid fa-magnifying-glass text-gray-400"></i>}
                />

                {/* Category filter */}
                <Select
                    mode="multiple"
                    placeholder="Categories"
                    style={{ minWidth: 150 }}
                    value={filterCategories}
                    onChange={(vals) => setFilterCategories(vals as number[])}
                    onOpenChange={handleLoadCategories}
                >
                    {categoryOptions.map((c) => (
                        <Select.Option key={c.id} value={c.id}>
                            {c.name}
                        </Select.Option>
                    ))}
                </Select>

                {/* Activity Group filter */}
                <Select
                    mode="multiple"
                    placeholder="Activity Groups"
                    style={{ minWidth: 150 }}
                    value={filterActivityGroups}
                    onChange={(vals) => setFilterActivityGroups(vals as number[])}
                    onOpenChange={handleLoadActivityGroups}
                >
                    {activityGroupOptions.map((g) => (
                        <Select.Option key={g.id} value={g.id}>
                            {g.name}
                        </Select.Option>
                    ))}
                </Select>

                {/* Status filter */}
                <Checkbox.Group
                    options={[
                        { label: 'Waiting', value: PlaceStatusEnum.WAITING },
                        { label: 'Approved', value: PlaceStatusEnum.APPROVED },
                        { label: 'Rejected', value: PlaceStatusEnum.REJECTED },
                    ]}
                    value={filterStatus}
                    onChange={(list) => setFilterStatus(list as number[])}
                    style={{ display: 'flex', gap: '8px' }}
                />

                {/* Price range */}
                <InputNumber
                    placeholder="Min Price"
                    style={{ width: 100 }}
                    min={0}
                    value={priceMin}
                    onChange={(val) => setPriceMin(val as number)}
                />
                <InputNumber
                    placeholder="Max Price"
                    style={{ width: 100 }}
                    min={0}
                    value={priceMax}
                    onChange={(val) => setPriceMax(val as number)}
                />

                {/* Distance km */}
                <InputNumber
                    placeholder="Distance km"
                    style={{ width: 120 }}
                    min={0}
                    value={distanceKm}
                    onChange={(val) => setDistanceKm(val as number)}
                />

                {/* Created date range */}
                <DatePicker.RangePicker
                    style={{ width: 260 }}
                    onChange={(dates) => {
                        if (dates) {
                            setCreatedFrom(dates[0]?.format('YYYY-MM-DD'));
                            setCreatedTo(dates[1]?.format('YYYY-MM-DD'));
                        } else {
                            setCreatedFrom(undefined);
                            setCreatedTo(undefined);
                        }
                    }}
                />
            </div>
        </div>
    );
};

export default PlaceFilters;
