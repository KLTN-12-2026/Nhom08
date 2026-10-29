import { useState } from "react";
import { Button, Table, Tag, Drawer, Form, Input, Select, Switch, Card, Space, Avatar } from "antd";

// Dữ liệu tĩnh chỉ để hiển thị giao diện
const USERS = [
  { id: 1, name: "Nguyễn Văn An", email: "nguyenvanan@gmail.com", phone_number: "0901234567", role: "admin", avatar: "https://i.pravatar.cc/150?img=11", points: 1250, level: 5, places: 12, reviews: 30, posts: 8, is_blocked: false, is_active: true, areas: ["Thành phố Hà Nội", "Thành phố Hồ Chí Minh"], trips: [20, 17, 3] },
  { id: 2, name: "Trần Thị Bình", email: "tranthibinh@gmail.com", phone_number: "0912345678", role: "user", avatar: "https://i.pravatar.cc/150?img=12", points: 820, level: 3, places: 5, reviews: 14, posts: 6, is_blocked: false, is_active: true, areas: ["Thành phố Hà Nội"], trips: [12, 10, 2] },
  { id: 3, name: "Lê Hoàng Cường", email: "lehoangcuong@gmail.com", phone_number: "0923456789", role: "moderator", avatar: null, points: 430, level: 2, places: 3, reviews: 9, posts: 2, is_blocked: false, is_active: false, areas: [], trips: [5, 4, 1] },
  { id: 4, name: "Phạm Minh Dũng", email: "phamminhdung@gmail.com", phone_number: "0934567890", role: "user", avatar: "https://i.pravatar.cc/150?img=14", points: 150, level: 1, places: 1, reviews: 2, posts: 0, is_blocked: true, is_active: true, areas: ["Thành phố Đà Nẵng"], trips: [3, 1, 2] },
  { id: 5, name: "Hoàng Thị Em", email: "hoangthiem@gmail.com", phone_number: "0945678901", role: "user", avatar: "https://i.pravatar.cc/150?img=15", points: 990, level: 4, places: 8, reviews: 21, posts: 11, is_blocked: false, is_active: true, areas: ["Thành phố Hồ Chí Minh"], trips: [15, 14, 1] },
  { id: 6, name: "Võ Quốc Gia", email: "voquocgia@gmail.com", phone_number: "0956789012", role: "user", avatar: null, points: 60, level: 1, places: 0, reviews: 1, posts: 1, is_blocked: false, is_active: true, areas: [], trips: [0, 0, 0] },
];

const ROLE_CONFIG: Record<string, { color: string; icon: string }> = {
  admin: { color: "gold", icon: "fa-crown" },
  user: { color: "blue", icon: "fa-user" },
  moderator: { color: "purple", icon: "fa-user-shield" },
};

const label = (icon: string, text: string) => (
  <span className="flex items-center gap-2">
    <i className={`fa-solid ${icon} text-black`}></i> {text}
  </span>
);

export default function Users() {
  const [drawerMode, setDrawerMode] = useState<"view" | "edit" | "add" | null>(null);
  const [selected, setSelected] = useState<any>(null);

  const open = (mode: "view" | "edit" | "add", user: any = null) => {
    setSelected(user);
    setDrawerMode(mode);
  };
  const close = () => setDrawerMode(null);

  const columns: any[] = [
    {
      title: label("fa-user", "Thông tin thành viên"),
      key: "info",
      render: (_: any, r: any) => (
        <div className="flex items-center gap-3">
          <Avatar src={r.avatar || undefined} size={40} style={{ backgroundColor: r.avatar ? undefined : "#FEF3C7" }}>
            {!r.avatar && <span className="font-bold text-yellow-600">{r.name.charAt(0)}</span>}
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900">{r.name}</div>
            <div className="text-gray-500 text-xs flex items-center gap-1">
              <i className="fa-solid fa-envelope text-xs"></i> {r.email}
            </div>
            <div className="text-gray-500 text-xs flex items-center gap-1">
              <i className="fa-solid fa-phone text-xs"></i> {r.phone_number}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: label("fa-shield-halved", "Vai trò"),
      dataIndex: "role",
      key: "role",
      render: (role: string) => (
        <Tag color={ROLE_CONFIG[role].color} icon={<i className={`fa-solid ${ROLE_CONFIG[role].icon} mr-1`}></i>}>
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </Tag>
      ),
    },
    {
      title: label("fa-wallet", "Ví điểm"),
      key: "wallet",
      render: (_: any, r: any) => (
        <div className="space-y-1">
          <Tag color="gold" icon={<i className="fa-solid fa-coins mr-1"></i>}>{r.points} điểm</Tag>
          <Tag color="purple" icon={<i className="fa-solid fa-star mr-1"></i>}>Level {r.level}</Tag>
        </div>
      ),
    },
    {
      title: label("fa-chart-simple", "Thống kê hoạt động"),
      key: "stats",
      render: (_: any, r: any) => (
        <div className="space-y-1">
          <div><Tag color="blue"><i className="fa-solid fa-location-dot mr-1"></i>{r.places} địa điểm</Tag></div>
          <div className="flex gap-1">
            <Tag color="green"><i className="fa-solid fa-star mr-1"></i>{r.reviews} đánh giá</Tag>
            <Tag color="orange"><i className="fa-solid fa-newspaper mr-1"></i>{r.posts} bài đăng</Tag>
          </div>
        </div>
      ),
    },
    {
      title: label("fa-circle-check", "Trạng thái"),
      key: "status",
      render: (_: any, r: any) => (
        <div className="space-y-1">
          <Tag
            color={r.is_blocked ? "error" : "success"}
            icon={<i className={`fa-solid ${r.is_blocked ? "fa-ban" : "fa-circle-check"} mr-1`}></i>}
          >
            {r.is_blocked ? "Bị chặn" : "Hoạt động"}
          </Tag>
          {!r.is_active && (
            <Tag color="warning" icon={<i className="fa-solid fa-pause mr-1"></i>}>Ngưng hoạt động</Tag>
          )}
        </div>
      ),
    },
    {
      title: <span className="font-semibold">Hành động</span>,
      key: "action",
      align: "center",
      width: 160,
      render: (_: any, r: any) => (
        <Space>
          <Button type="text" className="text-blue-500" icon={<i className="fa-solid fa-eye"></i>} onClick={() => open("view", r)}>
            Xem
          </Button>
          <Button type="text" className="text-green-500" icon={<i className="fa-solid fa-pen-to-square"></i>} onClick={() => open("edit", r)}>
            Sửa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <>
      {/* Tiêu đề */}
      <div className="mb-8">
        <div className="flex items-center gap-2 text-sm text-gray-400 mb-2 font-medium">
          <span>Trang chủ</span>
          <span>/</span>
          <span className="text-black">Người dùng</span>
        </div>
        <h1 className="text-3xl font-bold text-black">Quản lý người dùng</h1>
      </div>

      {/* Bảng danh sách */}
      <div className="bg-white rounded-3xl shadow-soft border border-gray-100 overflow-hidden">
        <div className="p-6 overflow-x-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <i className="fa-solid fa-users text-black text-lg"></i>
              </div>
              <h3 className="text-lg font-bold text-black m-0">Tất cả người dùng</h3>
            </div>
            <div className="flex gap-3">
              <Button className="rounded-full border-gray-200">Bộ lọc</Button>
              <Button type="primary" icon={<i className="fa-solid fa-plus text-black"></i>} onClick={() => open("add")}>
                Thêm người dùng mới
              </Button>
            </div>
          </div>
          <Table
            rowSelection={{}}
            columns={columns}
            dataSource={USERS}
            rowKey="id"
            scroll={{ x: 1000 }}
            pagination={{
              showSizeChanger: true,
              showTotal: (total, range) => `${range[0]}-${range[1]} của ${total} người dùng`,
            }}
          />
        </div>
      </div>

      {/* Drawer: Xem / Sửa / Thêm */}
      <Drawer
        title={
          <span className="flex items-center gap-2 text-lg">
            <i className={`fa-solid ${drawerMode === "add" ? "fa-user-plus" : "fa-user"} text-black`}></i>
            {drawerMode === "add" ? "Thêm Người Dùng Mới" : drawerMode === "edit" ? "Chỉnh Sửa Người Dùng" : "Chi Tiết Người Dùng"}
          </span>
        }
        open={drawerMode !== null}
        onClose={close}
        width={520}
        destroyOnClose
        footer={
          drawerMode === "view" ? null : (
            <div style={{ textAlign: "right" }}>
              <Button onClick={close} style={{ marginRight: 8 }}>Hủy</Button>
              <Button type="primary" onClick={close}>
                {drawerMode === "add" ? "Tạo Người Dùng" : "Lưu"}
              </Button>
            </div>
          )
        }
      >
        {drawerMode === "add" && (
          <Form layout="vertical" className="pt-4">
            <Form.Item label={label("fa-user", "Họ và Tên")} required>
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
            <Form.Item label={label("fa-envelope", "Email")} required>
              <Input placeholder="Nhập địa chỉ email" />
            </Form.Item>
            <Form.Item label={label("fa-at", "Tên đăng nhập")} required>
              <Input placeholder="Nhập tên đăng nhập" />
            </Form.Item>
            <Form.Item label={label("fa-lock", "Mật khẩu")} required>
              <Input.Password placeholder="Nhập mật khẩu" />
            </Form.Item>
            <Form.Item label={label("fa-lock-open", "Xác nhận mật khẩu")} required>
              <Input.Password placeholder="Nhập lại mật khẩu" />
            </Form.Item>
            <Form.Item label={label("fa-shield-halved", "Vai trò")} required>
              <Select placeholder="Chọn vai trò" options={[{ value: "user", label: "User" }, { value: "admin", label: "Admin" }]} />
            </Form.Item>
            <Form.Item label={label("fa-phone", "Số Điện Thoại")}>
              <Input placeholder="Nhập số điện thoại (tuỳ chọn)" />
            </Form.Item>
          </Form>
        )}

        {drawerMode === "edit" && selected && (
          <Form layout="vertical" className="pt-4" initialValues={selected}>
            <Form.Item name="name" label={label("fa-user", "Họ và Tên")} required>
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
            <Form.Item name="phone_number" label={label("fa-phone", "Số Điện Thoại")} required>
              <Input placeholder="Nhập số điện thoại" />
            </Form.Item>
            <Form.Item label={label("fa-ban", "Trạng Thái Người Dùng")}>
              <Switch defaultChecked={selected.is_blocked} checkedChildren="Bị chặn" unCheckedChildren="Hoạt động" />
            </Form.Item>
          </Form>
        )}

        {drawerMode === "view" && selected && (
          <div className="space-y-4">
            <Card className="bg-blue-50 border-blue-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-user text-white text-lg"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-600 text-sm mb-1">Họ và Tên</h3>
                  <p className="text-lg font-bold text-gray-900">{selected.name}</p>
                  <p className="text-gray-600 text-sm flex items-center gap-2 mt-1">
                    <i className="fa-solid fa-phone text-black"></i> {selected.phone_number}
                  </p>
                </div>
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card className="bg-orange-50 border-orange-200">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-wallet text-white text-lg"></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-600 text-sm mb-1">Ví điểm</h3>
                    <p className="text-lg font-bold text-gray-900">{selected.points}</p>
                  </div>
                </div>
              </Card>
              <Card className={selected.is_blocked ? "bg-red-50 border-red-200" : "bg-green-50 border-green-200"}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${selected.is_blocked ? "bg-red-500" : "bg-green-500"}`}>
                    <i className={`fa-solid ${selected.is_blocked ? "fa-circle-xmark" : "fa-circle-check"} text-white text-lg`}></i>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-600 text-sm mb-1">Trạng thái</h3>
                    <p className="text-base font-medium text-gray-900">{selected.is_blocked ? "Bị chặn" : "Hoạt động"}</p>
                  </div>
                </div>
              </Card>
            </div>

            <Card className="bg-cyan-50 border-cyan-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-cyan-500 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-location-dot text-white text-lg"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-600 text-sm mb-1">Khu Vực Hoạt Động</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selected.areas.length > 0
                      ? selected.areas.map((a: string) => <Tag color="blue" key={a}>{a}</Tag>)
                      : <Tag>Chưa có thông tin</Tag>}
                  </div>
                </div>
              </div>
            </Card>

            <Card className="bg-indigo-50 border-indigo-200">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center flex-shrink-0">
                  <i className="fa-solid fa-chart-simple text-white text-lg"></i>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-600 text-sm mb-2">Thống Kê Chuyến Đi</h3>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div>
                      <p className="text-xl font-bold text-blue-600">{selected.trips[0]}</p>
                      <p className="text-xs text-gray-500">Tổng</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-green-600">{selected.trips[1]}</p>
                      <p className="text-xs text-gray-500">Hoàn thành</p>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-red-600">{selected.trips[2]}</p>
                      <p className="text-xs text-gray-500">Đã hủy</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        )}
      </Drawer>
    </>
  );
}
