import React from "react";
import { Card, Form, Input, Button, message } from "antd";
import { useNavigate } from "react-router-dom";

export default function CustomerSupport() {
  const navigate = useNavigate();
  const [form] = Form.useForm();

  const handleFinish = (values: any) => {
    message.success("Yêu cầu hỗ trợ của bạn đã được gửi. Chúng tôi sẽ phản hồi sớm nhất qua Email!");
    form.resetFields();
    navigate("/home");
  };

  return (
    <div className="max-w-2xl mx-auto w-full py-4">
      <Card className="bg-white border-none rounded-[32px] p-8 shadow-[0_15px_30px_rgba(0,0,0,0.06)]">
        <div className="space-y-2 mb-6 text-center sm:text-left">
          <h2 className="text-3xl font-black text-black">Gửi yêu cầu hỗ trợ</h2>
          <p className="text-gray-500 font-semibold text-sm">
            Bạn gặp sự cố kỹ thuật hoặc lỗi ứng dụng? Hãy gửi thông tin chi tiết để chúng tôi hỗ trợ.
          </p>
        </div>

        <Form form={form} layout="vertical" onFinish={handleFinish} className="space-y-4">
          <Form.Item
            name="subject"
            label={<span className="font-bold text-sm">Tiêu đề hỗ trợ</span>}
            rules={[{ required: true, message: "Vui lòng nhập tiêu đề hỗ trợ!" }]}
          >
            <Input placeholder="Ví dụ: Không thể nâng cấp Premium" className="rounded-xl py-2 border-gray-200" />
          </Form.Item>

          <Form.Item
            name="content"
            label={<span className="font-bold text-sm">Nội dung chi tiết</span>}
            rules={[{ required: true, message: "Vui lòng nhập nội dung chi tiết sự cố!" }]}
          >
            <Input.TextArea placeholder="Mô tả sự cố bạn đang gặp phải..." rows={4} className="rounded-xl border-gray-200" />
          </Form.Item>

          <div className="pt-4 flex justify-end gap-3">
            <Button onClick={() => navigate("/home")} className="rounded-full px-6 font-bold">
              Quay lại
            </Button>
            <Button
              type="primary"
              htmlType="submit"
              className="bg-black hover:bg-black/90 border-none text-white font-bold px-8 rounded-full"
            >
              Gửi yêu cầu
            </Button>
          </div>
        </Form>
      </Card>
    </div>
  );
}
