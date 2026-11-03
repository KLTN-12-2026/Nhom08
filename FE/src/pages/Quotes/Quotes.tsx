"use client";

import { useState, useEffect } from "react";
import {
  Button,
  Table,
  Tag,
  Drawer,
  Form,
  Input,
  Spin,
  Switch,
  Space,
  Popconfirm,
  InputNumber,
  Select,
} from "antd";
import type { ColumnsType, TablePaginationConfig } from "antd/es/table";
import useQuotesStore, { Quote } from "./QuotesStore.ts";
import useLanguageStore from "../../stores/languageStore.ts";
import toast from "react-hot-toast";

const { TextArea } = Input;
const { Option } = Select;

export default function Quotes() {
  const { t } = useLanguageStore();
  const {
    quotes,
    loading,
    pagination,
    fetchQuotes,
    createQuote,
    updateQuote,
    deleteQuote,
    toggleQuote,
  } = useQuotesStore();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  useEffect(() => {
    fetchQuotes({ page: currentPage, per_page: pageSize });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const handleTableChange = (p: TablePaginationConfig) => {
    setCurrentPage(p.current || 1);
    setPageSize(p.pageSize || 10);
  };

  const handleAddQuote = () => {
    setIsEditMode(false);
    setEditingId(null);
    form.resetFields();
    form.setFieldsValue({
      type: "motivational",
      language: "vi",
      priority: 5,
      is_active: true,
    });
    setIsDrawerOpen(true);
  };

  const handleEditQuote = (quote: Quote) => {
    setIsEditMode(true);
    setEditingId(quote.id);
    form.resetFields();
    form.setFieldsValue({
      content: quote.content,
      type: quote.type,
      language: quote.language,
      priority: quote.priority,
      is_active: Boolean(quote.is_active),
    });
    setIsDrawerOpen(true);
  };

  const handleDeleteQuote = async (id: number) => {
    try {
      await deleteQuote(id);
      toast.success("Xóa trích dẫn thành công 🗑");
    } catch (error: any) {
      toast.error(error.message || "Xóa trích dẫn thất bại");
    }
  };

  const handleToggleQuote = async (id: number) => {
    try {
      await toggleQuote(id);
      toast.success("Cập nhật trạng thái thành công ✅");
    } catch (error: any) {
      toast.error(error.message || "Không thể cập nhật trạng thái");
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();

      if (isEditMode && editingId) {
        await updateQuote(editingId, values);
        toast.success("Cập nhật trích dẫn thành công ✅");
      } else {
        await createQuote(values);
        toast.success("Thêm trích dẫn mới thành công ✅");
      }

      setIsDrawerOpen(false);
      form.resetFields();
    } catch (error: any) {
      if (error?.message) {
        toast.error(error.message);
      }
    }
  };

  const columns: ColumnsType<Quote> = [
    {
      title: <span className="font-semibold">{t("quotes.content") || "Nội dung trích dẫn"}</span>,
      dataIndex: "content",
      key: "content",
      ellipsis: true,
      render: (text) => (
        <div className="max-w-md">
          <p className="text-sm font-medium text-gray-900 mb-0">{text}</p>
        </div>
      ),
    },
    {
      title: <span className="font-semibold">{t("quotes.type") || "Thể loại"}</span>,
      dataIndex: "type",
      key: "type",
      width: 160,
      render: (type) => <Tag color="blue">{type || "N/A"}</Tag>,
    },
    {
      title: <span className="font-semibold">{t("quotes.language") || "Ngôn ngữ"}</span>,
      dataIndex: "language",
      key: "language",
      align: "center",
      width: 110,
      render: (lang) => (
        <Tag color="purple" className="uppercase font-semibold">
          {lang || "N/A"}
        </Tag>
      ),
    },
    {
      title: <span className="font-semibold">{t("quotes.priority") || "Độ ưu tiên"}</span>,
      dataIndex: "priority",
      key: "priority",
      align: "center",
      width: 110,
      render: (priority) => (
        <Tag color={priority > 6 ? "red" : priority > 3 ? "orange" : "green"}>
          Mức {priority}
        </Tag>
      ),
    },
    {
      title: <span className="font-semibold">{t("quotes.status") || "Trạng thái"}</span>,
      dataIndex: "is_active",
      key: "is_active",
      align: "center",
      width: 140,
      render: (isActive, record) => (
        <Switch
          checked={Boolean(isActive)}
          onChange={() => handleToggleQuote(record.id)}
          checkedChildren="Bật"
          unCheckedChildren="Tắt"
        />
      ),
    },
    {
      title: <span className="font-semibold">{t("quotes.actions") || "Hành động"}</span>,
      key: "action",
      align: "center",
      width: 130,
      render: (_, record) => (
        <Space>
          <Button
            icon={<i className="fa-solid fa-pen-to-square"></i>}
            type="text"
            className="text-blue-500 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => handleEditQuote(record)}
          />
          <Popconfirm
            title="Xóa trích dẫn này?"
            description="Bạn có chắc chắn muốn xóa trích dẫn này không?"
            onConfirm={() => handleDeleteQuote(record.id)}
            okText="Xóa"
            okButtonProps={{ danger: true }}
            cancelText="Hủy"
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
    current: currentPage,
    pageSize: pageSize,
    total: pagination.total || quotes.length,
    showSizeChanger: true,
    showTotal: (total: number, range: [number, number]) =>
      `${range[0]}-${range[1]} của ${total} trích dẫn`,
  };

  return (
    <>
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-medium">
          <span>{t("common.home") || "Trang chủ"}</span>
          <span>/</span>
          <span className="text-black">{t("navigation.quotes") || "Trích dẫn"}</span>
        </div>
        <h1 className="text-3xl font-bold text-black">{t("quotes.title") || "Quản lý trích dẫn & lời khuyên"}</h1>
      </div>

      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="p-6">
          <div className="mb-6 flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center text-primary-600">
                <i className="fa-solid fa-quote-left text-black text-lg"></i>
              </div>
              <h3 className="text-lg font-bold text-black m-0">
                Tất cả trích dẫn <span className="text-gray-400 font-medium text-base">({pagination.total || quotes.length})</span>
              </h3>
            </div>
            <div className="flex items-center gap-3">
              <Button icon={<i className="fa-solid fa-rotate-right mr-1" />} onClick={() => fetchQuotes({ page: currentPage, per_page: pageSize })}>
                Tải lại
              </Button>
              <Button
                type="primary"
                icon={<i className="fa-solid fa-plus text-black"></i>}
                className="shadow-lg shadow-yellow-200/50"
                onClick={handleAddQuote}
              >
                {t("quotes.addNew") || "Thêm trích dẫn mới"}
              </Button>
            </div>
          </div>
          <Table
            columns={columns}
            dataSource={quotes}
            loading={loading}
            rowKey="id"
            pagination={paginationConfig}
            onChange={handleTableChange}
          />
        </div>
      </div>

      <Drawer
        title={
          <span className="flex items-center gap-2 text-lg">
            <i className="fa-solid fa-quote-left text-black"></i>
            {isEditMode ? "Chỉnh sửa trích dẫn" : "Thêm trích dẫn mới"}
          </span>
        }
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        width={600}
        destroyOnHidden
        footer={
          <div className="flex justify-end gap-2">
            <Button onClick={() => setIsDrawerOpen(false)}>Hủy</Button>
            <Button type="primary" onClick={handleSave} loading={loading}>
              Lưu thay đổi
            </Button>
          </div>
        }
      >
        <Form form={form} layout="vertical" className="pt-4">
          <Form.Item
            name="content"
            label="Nội dung trích dẫn"
            rules={[{ required: true, message: "Vui lòng nhập nội dung trích dẫn" }]}
          >
            <TextArea rows={4} placeholder="Nhập câu trích dẫn, câu chào hoặc lời khuyên..." />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="type"
              label="Thể loại"
              rules={[{ required: true, message: "Vui lòng chọn thể loại" }]}
            >
              <Select placeholder="Chọn thể loại">
                <Option value="notification">Thông báo (Notification)</Option>
                <Option value="comment_suggestion">Gợi ý bình luận (Comment Suggestion)</Option>
                <Option value="tip">Mẹo vặt (Tip)</Option>
                <Option value="greeting">Lời chào (Greeting)</Option>
                <Option value="motivational">Động lực (Motivational)</Option>
                <Option value="inspirational">Cảm hứng (Inspirational)</Option>
                <Option value="funny">Hài hước (Funny)</Option>
                <Option value="wisdom">Châm ngôn (Wisdom)</Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="language"
              label="Ngôn ngữ"
              rules={[{ required: true, message: "Vui lòng chọn ngôn ngữ" }]}
            >
              <Select placeholder="Chọn ngôn ngữ">
                <Option value="vi">Tiếng Việt (vi)</Option>
                <Option value="en">Tiếng Anh (en)</Option>
              </Select>
            </Form.Item>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item
              name="priority"
              label="Độ ưu tiên (1 - 10)"
              initialValue={1}
              rules={[{ required: true, message: "Vui lòng nhập độ ưu tiên" }]}
            >
              <InputNumber min={1} max={10} className="w-full" placeholder="1-10" />
            </Form.Item>

            <Form.Item
              name="is_active"
              label="Trạng thái hiển thị"
              valuePropName="checked"
              initialValue={true}
            >
              <Switch
                checkedChildren="Bật"
                unCheckedChildren="Tắt"
              />
            </Form.Item>
          </div>
        </Form>
      </Drawer>
    </>
  );
}
