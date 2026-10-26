"use client";

import { useState, useEffect } from "react";
import {
    Button,
    Table,
    Tag,
    Modal,
    Form,
    Input,
    Spin,
    message,
    Card,
    Space,
    Popconfirm,
    InputNumber,
    Rate,
    Image,
    Select,
    Upload,
    Menu,
    Switch,
    DatePicker,
} from "antd";
import { activityGroups } from "../../data/remote/activityGroups";
import tagsAPI from "../../data/remote/tags";
import categoriesAPI from "../../data/remote/categories";
import { PlaceStatusEnum, getPlaceStatusLabel } from "./PlaceStatusEnum.ts";
import { Checkbox } from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import { RepositoryManager } from "../../data/repositoryManager";
import usePlacesStore, { Place } from "./PlacesStore.ts";
import PlaceFormModal from "./components/PlaceFormModal.tsx";
import useLanguageStore from "../../stores/languageStore.ts";

const { TextArea } = Input;
const { Option } = Select;

export default function Places() {
    const { t } = useLanguageStore();
    const {
        getPlaces,
        getPlaceById,
        createPlace,
        updatePlace,
        deletePlace,
        placesData,
        placeData,
        isListLoading,
        isDetailLoading,
        isSaving,
    } = usePlacesStore();

    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [isEditMode, setIsEditMode] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(30);
    const [searchText, setSearchText] = useState("");
    const [approved, setApproved] = useState<boolean | undefined>(undefined);
    const [filterCategories, setFilterCategories] = useState<number[]>([]);
    const [filterActivityGroups, setFilterActivityGroups] = useState<number[]>([]);
    const [filterStatus, setFilterStatus] = useState<number[]>([]);
    const [priceMin, setPriceMin] = useState<number | undefined>(undefined);
    const [priceMax, setPriceMax] = useState<number | undefined>(undefined);
    const [distanceKm, setDistanceKm] = useState<number | undefined>(undefined);
    const [createdFrom, setCreatedFrom] = useState<string | undefined>(undefined);
    const [createdTo, setCreatedTo] = useState<string | undefined>(undefined);
    const [activityGroupOptions, setActivityGroupOptions] = useState<Array<{ id: number; name: string }>>([]);
    const [tagOptions, setTagOptions] = useState<Array<{ id: number; name: string }>>([]);
    const [categoryOptions, setCategoryOptions] = useState<Array<{ id: number; name: string }>>([]);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [isBulkApproving, setIsBulkApproving] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => { fetchPlaces(); }, [currentPage, pageSize, searchText, approved, filterCategories, filterActivityGroups, filterStatus, priceMin, priceMax, distanceKm, createdFrom, createdTo]);

    // Lazy load handlers
    const handleLoadActivityGroups = async (open: boolean) => {
        if (open && activityGroupOptions.length === 0) {
            try {
                const res = await activityGroups.getGroups();
                // Based on user JSON: { success: true, data: { data: [...] } }
                if (res.success && res.data && Array.isArray(res.data.data)) {
                    setActivityGroupOptions(res.data.data.map((g: any) => ({ id: g.id, name: g.name })));
                } else if (Array.isArray(res)) {
                    // Fallback for array response
                    setActivityGroupOptions(res.map((g: any) => ({ id: g.id, name: g.name })));
                }
            } catch (e) {
                console.error('Failed to load activity groups', e);
            }
        }
    };

    const handleLoadTags = async (open: boolean) => {
        if (open && tagOptions.length === 0) {
            try {
                const res = await tagsAPI.getTags();
                if (res.success && res.data) {
                    setTagOptions(res.data.data.map((t: any) => ({ id: t.id, name: t.name })));
                }
            } catch (e) {
                console.error('Failed to load tags', e);
            }
        }
    };

    const handleLoadCategories = async (open: boolean) => {
        if (open && categoryOptions.length === 0) {
            try {
                const catsRes = await categoriesAPI.getCategories();
                if (catsRes.success && catsRes.data) {
                    setCategoryOptions(catsRes.data.data.map((c: any) => ({ id: c.id, name: c.display_name })));
                }
            } catch (e) {
                console.error('Failed to load categories', e);
            }
        }
    };

    const handleQuickApprove = async (id: number, checked: boolean) => {
        try {
            if (checked) {
                await RepositoryManager.places.approvePlace(id);
                message.success("Place approved successfully");
            } else {
                // If unchecking, maybe we want to reject or set to waiting? 
                // For now let's assume uncheck means reject or just toggle off approval
                await RepositoryManager.places.rejectPlace(id);
                message.success("Place rejected/unapproved");
            }
            fetchPlaces(); // Refresh list
        } catch (error) {
            message.error("Failed to update status");
        }
    };

    const handleBulkApprove = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Vui lòng chọn ít nhất một địa điểm");
            return;
        }

        try {
            setIsBulkApproving(true);
            const result = await RepositoryManager.places.approveAll({
                ids: selectedRowKeys.map((key) => Number(key)),
            });

            if (result.success) {
                message.success(`Đã approve ${selectedRowKeys.length} địa điểm thành công`);
                setSelectedRowKeys([]);
                fetchPlaces();
            } else {
                message.error(result.message || "Không thể approve các địa điểm đã chọn");
            }
        } catch (error: any) {
            message.error(error?.message || "Đã xảy ra lỗi khi approve");
        } finally {
            setIsBulkApproving(false);
        }
    };

    const handleBulkReject = async () => {
        if (selectedRowKeys.length === 0) {
            message.warning("Vui lòng chọn ít nhất một địa điểm");
            return;
        }

        try {
            setIsBulkApproving(true);
            const result = await RepositoryManager.places.rejectAll({
                ids: selectedRowKeys.map((key) => Number(key)),
            });

            if (result.success) {
                message.success(`Đã reject ${selectedRowKeys.length} địa điểm thành công`);
                setSelectedRowKeys([]);
                fetchPlaces();
            } else {
                message.error(result.message || "Không thể reject các địa điểm đã chọn");
            }
        } catch (error: any) {
            message.error(error?.message || "Đã xảy ra lỗi khi reject");
        } finally {
            setIsBulkApproving(false);
        }
    };

    const fetchPlaces = () => {
        const params = {
            page: currentPage,
            per_page: pageSize,
            search: searchText || undefined,
            approved: approved,
            category_ids: filterCategories,
            activity_group_ids: filterActivityGroups,
            status: filterStatus.length ? filterStatus.join(',') : undefined,
            price_min: priceMin,
            price_max: priceMax,
            distance_km: distanceKm,
            created_from: createdFrom,
            created_to: createdTo,
        };
        getPlaces(params);
    };


    const handleTableChange = (pagination: TablePaginationConfig) => {
        setCurrentPage(pagination.current || 1);
        setPageSize(pagination.pageSize || 30);
    };

    const handleSearch = (value: string) => {
        setSearchText(value);
        setCurrentPage(1);
    };

    const handleAddPlace = () => {
        setIsEditMode(false);
        form.resetFields();
        setIsDrawerOpen(true);
    };

    const handleRandomFill = () => {
        const randomData = {
            name: "Nhà hàng RANDOM  " + Math.floor(Math.random() * 1000),
            address: "123 Đường ABC, Quận 1, TP.HCM",
            latitude: 10.762622,
            longitude: 106.660172,
            description: "Nhà hàng ngon tuyệt vời với không gian thoáng mát.",
            category_ids: [1, 2],
            activity_group_ids: [1, 2],
            average_price: 150000,
            contact_email: "contact@restaurant.com",
            contact_phone: "0123456789",
            is_anonymous: false,
            tags: ["romantic", "outdoor"],
        };
        form.setFieldsValue(randomData);
    };

    const handleEditPlace = async (id: number) => {
        setIsEditMode(true);
        setIsDrawerOpen(true);
        form.resetFields();

        // Pre-load tất cả options trước khi populate form
        // (để các Select hiển thị đúng label khi edit)
        const loadAllOptions = async () => {
            const promises = [];
            if (tagOptions.length === 0) {
                promises.push(
                    tagsAPI.getTags().then(res => {
                        if (res.success && res.data)
                            setTagOptions(res.data.data.map((t: any) => ({ id: t.id, name: t.name })));
                    }).catch(() => {})
                );
            }
            if (categoryOptions.length === 0) {
                promises.push(
                    import('../../data/remote/categories').then(m => m.default.getCategories()).then((res: any) => {
                        if (res.success && res.data)
                            setCategoryOptions(res.data.data.map((c: any) => ({ id: c.id, name: c.display_name })));
                    }).catch(() => {})
                );
            }
            if (activityGroupOptions.length === 0) {
                promises.push(
                    import('../../data/remote/activityGroups').then(m => m.activityGroups.getGroups()).then((res: any) => {
                        if (res.success && res.data && Array.isArray(res.data.data))
                            setActivityGroupOptions(res.data.data.map((g: any) => ({ id: g.id, name: g.name })));
                    }).catch(() => {})
                );
            }
            await Promise.all(promises);
        };

        const result = await getPlaceById(id);
        if (result.success && result.data) {
            const placeData = result.data.data;
            await loadAllOptions();
            const formData = {
                ...placeData,
                // Map categories array → array of IDs cho Select
                category_ids: placeData.categories?.map((c: any) => c.id) || [],
                // Map activity_groups array → array of IDs
                activity_group_ids: placeData.activity_groups?.map((g: any) => g.id) || [],
                // Map tags array → array of tag names
                tags: placeData.tags?.map((t: any) => t.name || t) || [],
                // Map media → AntD Upload fileList format để hiển thị ảnh cũ
                images: (placeData.media || []).map((m: any, i: number) => ({
                    uid: String(m.id ?? -i),
                    name: m.file_name || m.name || `image-${i + 1}`,
                    status: 'done',
                    url: m.original_url || m.url || '',
                    thumbUrl: m.original_url || m.url || '',
                })),
            };
            form.setFieldsValue(formData);
        } else {
            message.error("Failed to load place details");
        }
    };

    const handleDeletePlace = async (id: number) => {
        const result = await deletePlace(id);
        if (result.success) {
            fetchPlaces();
        }
    };

    const handleSave = async () => {
        try {
            const values = await form.validateFields();

            // Prepare FormData for file upload
            const formData = new FormData();

            // Add all text fields
            Object.keys(values).forEach(key => {
                if (key === 'images') return; // Skip images, handle separately

                const value = values[key];
                if (value !== undefined && value !== null) {
                    if (Array.isArray(value)) {
                        // For arrays like category_ids, tags
                        value.forEach((item, index) => {
                            formData.append(`${key}[${index}]`, item);
                        });
                    } else {
                        formData.append(key, value);
                    }
                }
            });

            // Handle image uploads from Upload component
            // valuePropName="fileList" means values.images IS the fileList array directly
            const fileList = Array.isArray(values.images) ? values.images : values.images?.fileList || [];
            const newFiles = fileList.filter((file: any) => file.originFileObj); // only NEW files
            newFiles.forEach((file: any, index: number) => {
                formData.append(`images[${index}]`, file.originFileObj);
            });
            if (newFiles.length > 0) {
                console.log('📸 Uploading', newFiles.length, 'new image(s)');
            }

            let result;
            if (isEditMode && placeData?.data?.id) {
                result = await updatePlace(placeData.data.id, formData as any);
            } else {
                result = await createPlace(formData as any);
            }

            if (result.success) {
                setIsDrawerOpen(false);
                form.resetFields();
                fetchPlaces();
            }
        } catch (err) {
            console.error(err);
        }
    };


    const columns: ColumnsType<Place> = [
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-location-dot text-black"></i>
                    <span className="font-semibold">{t("places.info")}</span>
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
                    <span className="font-semibold">{t("places.activityGroups")}</span>
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
                        <span className="text-gray-400 text-xs">
                            {t("common.loading") === "Đang tải..." ? "Không có nhóm" : "No groups"}
                        </span>
                    )}
                </div>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-tag text-black"></i>
                    <span className="font-semibold">{t("places.price")}</span>
                </span>
            ),
            dataIndex: "average_price",
            key: "average_price",
            render: (price) => {
                if (!price || price === 0) {
                    return <span className="text-gray-400 text-sm">N/A</span>;
                }

                // Determine color based on price range
                let colorClass = "text-green-600"; // Default: under 200k
                if (price >= 500000) {
                    colorClass = "text-red-600"; // Expensive: over 500k
                } else if (price >= 200000) {
                    colorClass = "text-orange-600"; // Medium: 200k-500k
                }

                return (
                    <span className={`font-semibold ${colorClass}`}>
                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price)}
                    </span>
                );
            },
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-user text-black"></i>
                    <span className="font-semibold">{t("places.owner")}</span>
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
                        <Tag color="default">
                            {t("common.loading") === "Đang tải..." ? "Người dùng ẩn danh" : "Unknown User"}
                        </Tag>
                    )}
                </div>
            ),
        },
        {
            title: (
                <span className="flex items-center gap-2">
                    <i className="fa-solid fa-circle-check text-black"></i>
                    <span className="font-semibold">{t("places.status")}</span>
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
            title: <span className="font-semibold">{t("places.actions")}</span>,
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
                        title={t("common.loading") === "Đang tải..." ? "Xóa địa điểm này?" : "Delete this place?"}
                        description={t("common.loading") === "Đang tải..." ? "Bạn có chắc muốn xóa địa điểm này?" : "Are you sure to delete this place?"}
                        onConfirm={() => handleDeletePlace(record.id)}
                        okText={t("common.yes") || "Yes"}
                        cancelText={t("common.no") || "No"}
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

    const paginationConfig = {
        current: placesData?.current_page || 1,
        pageSize: placesData?.per_page || 30,
        total: placesData?.total || 0,
        showSizeChanger: true,
        showTotal: (total: number, range: [number, number]) =>
            t("common.loading") === "Đang tải..."
                ? `${range[0]}-${range[1]} của ${total} địa điểm`
                : `${range[0]}-${range[1]} of ${total} places`,
    };

    return (
        <>
            <div className="mb-8">
                <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-medium">
                    <span>{t("common.home") || "Home"}</span>
                    <span>/</span>
                    <span className="text-black">{t("navigation.places")}</span>
                </div>
                <h1 className="text-3xl font-bold text-black">{t("places.title")}</h1>
            </div>

            <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
                <div className="p-6">
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
                                        {t("common.loading") === "Đang tải..." ? "Phê duyệt" : "Approve"}
                                    </Button>
                                    <Button
                                        size="small"
                                        danger
                                        icon={<i className="fa-solid fa-times"></i>}
                                        onClick={handleBulkReject}
                                        loading={isBulkApproving}
                                    >
                                        {t("common.loading") === "Đang tải..." ? "Từ chối" : "Reject"}
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
                                onClick={handleAddPlace}
                            >
                                {t("places.addNew")}
                            </Button>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Search */}
                            <Input.Search
                                placeholder={t("places.search")}
                                onSearch={handleSearch}
                                style={{ width: 250 }}
                                className="rounded-xl"
                                prefix={<i className="fa-solid fa-magnifying-glass text-gray-400"></i>}
                            />
                            {/* Category filter */}
                            <Select
                                mode="multiple"
                                placeholder={t("navigation.categories")}
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
                                placeholder={t("navigation.activityGroups")}
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
                            {/* Status filter (friendly) */}
                            <Checkbox.Group
                                options={[
                                    { label: t("common.loading") === "Đang tải..." ? "Chờ duyệt" : "Waiting", value: PlaceStatusEnum.WAITING },
                                    { label: t("common.loading") === "Đang tải..." ? "Đã duyệt" : "Approved", value: PlaceStatusEnum.APPROVED },
                                    { label: t("common.loading") === "Đang tải..." ? "Từ chối" : "Rejected", value: PlaceStatusEnum.REJECTED },
                                ]}
                                value={filterStatus}
                                onChange={(list) => setFilterStatus(list as number[])}
                                style={{ display: 'flex', gap: '8px' }}
                            />
                            {/* Price range */}
                            <InputNumber
                                placeholder={t("common.loading") === "Đang tải..." ? "Giá tối thiểu" : "Min Price"}
                                style={{ width: 100 }}
                                min={0}
                                value={priceMin}
                                onChange={(val) => setPriceMin(val as number)}
                            />
                            <InputNumber
                                placeholder={t("common.loading") === "Đang tải..." ? "Giá tối đa" : "Max Price"}
                                style={{ width: 100 }}
                                min={0}
                                value={priceMax}
                                onChange={(val) => setPriceMax(val as number)}
                            />
                            {/* Distance km */}
                            <InputNumber
                                placeholder={t("common.loading") === "Đang tải..." ? "Khoảng cách (km)" : "Distance km"}
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
                    <Table
                        columns={columns}
                        dataSource={placesData?.data}
                        loading={isListLoading}
                        rowKey="id"
                        pagination={paginationConfig}
                        onChange={handleTableChange}
                        scroll={{ x: 1200 }}
                        rowSelection={{
                            selectedRowKeys,
                            onChange: (selectedKeys) => {
                                setSelectedRowKeys(selectedKeys);
                            },
                            getCheckboxProps: (record) => ({
                                disabled: false,
                            }),
                        }}
                    />
                </div>
            </div>

            <PlaceFormModal
                open={isDrawerOpen}
                isEditMode={isEditMode}
                isDetailLoading={isDetailLoading}
                isSaving={isSaving}
                form={form}
                tagOptions={tagOptions}
                categoryOptions={categoryOptions}
                activityGroupOptions={activityGroupOptions}
                onClose={() => { setIsDrawerOpen(false); form.resetFields(); }}
                onSave={handleSave}
                onRandomFill={handleRandomFill}
                handleLoadTags={handleLoadTags}
                handleLoadCategories={handleLoadCategories}
                handleLoadActivityGroups={handleLoadActivityGroups}
            />
        </>
    );
}
