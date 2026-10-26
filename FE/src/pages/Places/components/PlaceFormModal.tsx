import React from 'react';
import {
    Modal,
    Form,
    Input,
    Spin,
    Button,
    InputNumber,
    Select,
    Upload,
} from 'antd';

const { TextArea } = Input;
const { Option } = Select;

interface PlaceFormModalProps {
    open: boolean;
    isEditMode: boolean;
    isDetailLoading: boolean;
    isSaving: boolean;
    form: any;
    tagOptions: Array<{ id: number; name: string }>;
    categoryOptions: Array<{ id: number; name: string }>;
    activityGroupOptions: Array<{ id: number; name: string }>;
    onClose: () => void;
    onSave: () => void;
    onRandomFill: () => void;
    handleLoadTags: (open: boolean) => void;
    handleLoadCategories: (open: boolean) => void;
    handleLoadActivityGroups: (open: boolean) => void;
}

const PlaceFormModal: React.FC<PlaceFormModalProps> = ({
    open,
    isEditMode,
    isDetailLoading,
    isSaving,
    form,
    tagOptions,
    categoryOptions,
    activityGroupOptions,
    onClose,
    onSave,
    onRandomFill,
    handleLoadTags,
    handleLoadCategories,
    handleLoadActivityGroups,
}) => {
    return (
        <Modal
            title={
                <span className="flex items-center gap-2 text-lg">
                    <i className="fa-solid fa-location-dot text-black"></i>
                    {isEditMode ? "Edit Place" : "New Place"}
                </span>
            }
            open={open}
            onCancel={onClose}
            width={900}
            forceRender
            footer={
                <div className="flex justify-end gap-2">
                    {!isEditMode && (
                        <Button onClick={onRandomFill} className="mr-auto" icon={<i className="fa-solid fa-dice text-purple-500"></i>}>
                            Random Fill
                        </Button>
                    )}
                    <Button onClick={onClose}>Cancel</Button>
                    <Button type="primary" onClick={onSave} loading={isSaving}>
                        Save
                    </Button>
                </div>
            }
        >
            {isDetailLoading ? (
                <div className="flex justify-center items-center h-40">
                    <Spin tip="Đang tải..." size="large">
                        <div style={{ minHeight: 80 }} />
                    </Spin>
                </div>
            ) : (
                <Form form={form} layout="vertical" className="pt-4">
                    {/* Image Upload - Form.Item must have single child */}
                    <Form.Item label="Images" name="images" valuePropName="fileList" getValueFromEvent={(e) => Array.isArray(e) ? e : e?.fileList}>
                        <Upload
                            listType="picture-card"
                            multiple
                            maxCount={10}
                            beforeUpload={() => false}
                            accept="image/*"
                        >
                            <div className="flex flex-col items-center justify-center">
                                <i className="fa-solid fa-plus text-2xl text-gray-400 mb-2"></i>
                                <div className="text-sm text-gray-500">Upload</div>
                            </div>
                        </Upload>
                    </Form.Item>
                    <p className="text-xs text-gray-400 -mt-4 mb-4">Maximum 10 images. Supported: JPG, PNG, GIF</p>

                    <Form.Item
                        name="name"
                        label="Place Name"
                        rules={[{ required: true, message: "Please enter place name" }]}
                    >
                        <Input placeholder="e.g., The Coffee House" />
                    </Form.Item>

                    <Form.Item
                        name="address"
                        label="Address"
                        rules={[{ required: true, message: "Please enter address" }]}
                    >
                        <Input placeholder="Full address" />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="latitude" label="Latitude">
                            <InputNumber className="w-full" placeholder="10.762622" step={0.000001} />
                        </Form.Item>

                        <Form.Item name="longitude" label="Longitude">
                            <InputNumber className="w-full" placeholder="106.660172" step={0.000001} />
                        </Form.Item>
                    </div>

                    <Form.Item name="description" label="Description">
                        <TextArea rows={4} placeholder="Describe this place..." />
                    </Form.Item>

                    <div className="grid grid-cols-2 gap-4">
                        <Form.Item name="average_price" label="Average Price (VND)">
                            <InputNumber className="w-full" min={0} placeholder="50000" />
                        </Form.Item>

                        <Form.Item name="contact_phone" label="Contact Phone">
                            <Input placeholder="0123456789" />
                        </Form.Item>
                    </div>

                    <Form.Item name="contact_email" label="Contact Email">
                        <Input type="email" placeholder="contact@place.com" />
                    </Form.Item>

                    <div className="grid grid-cols-3 gap-4">
                        <Form.Item name="tags" label="Tags">
                            <Select
                                mode="multiple"
                                placeholder="Select tags"
                                allowClear
                                onOpenChange={handleLoadTags}
                            >
                                {tagOptions.map(tag => (
                                    <Option key={tag.id} value={tag.name}>{tag.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="category_ids"
                            label="Categories"
                            rules={[{ required: true, message: "Please select at least one category" }]}
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select categories"
                                allowClear
                                onOpenChange={handleLoadCategories}
                            >
                                {categoryOptions.map(cat => (
                                    <Option key={cat.id} value={cat.id}>{cat.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>

                        <Form.Item
                            name="activity_group_ids"
                            label="Activity Groups"
                        >
                            <Select
                                mode="multiple"
                                placeholder="Select activity groups"
                                allowClear
                                onOpenChange={handleLoadActivityGroups}
                            >
                                {activityGroupOptions.map(group => (
                                    <Option key={group.id} value={group.id}>{group.name}</Option>
                                ))}
                            </Select>
                        </Form.Item>
                    </div>
                </Form>
            )}
        </Modal>
    );
};

export default PlaceFormModal;
