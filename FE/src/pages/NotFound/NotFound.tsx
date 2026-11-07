"use client";

import React from "react";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-primary-400 text-white px-4">
      <div className="max-w-xl text-center space-y-8">
        <div className="space-y-3">
          <p className="text-sm font-semibold tracking-[0.25em] uppercase">
            Oops!
          </p>
          <h1 className="text-6xl sm:text-7xl font-extrabold tracking-tight drop-shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            404
          </h1>
          <h2 className="text-2xl sm:text-3xl font-semibold">
            Không tìm thấy trang bạn cần
          </h2>
          <p className="text-sm sm:text-base text-white/80">
            Có thể liên kết đã hết hạn, bị thay đổi hoặc bạn gõ sai địa chỉ.
            Hãy quay lại trang chính và tiếp tục khám phá Trove.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4">
          <Link
            to="/"
            className="inline-flex items-center justify-center px-6 py-3 rounded-full bg-black text-white font-semibold text-sm sm:text-base shadow-[0_12px_30px_rgba(0,0,0,0.35)] hover:bg-secondary-900 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-house mr-2" />
            Về trang chủ
          </Link>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center px-5 py-3 rounded-full border border-white/50 text-white font-medium text-sm sm:text-base hover:bg-white/10 transition-transform duration-200 hover:-translate-y-0.5"
          >
            <i className="fa-solid fa-arrow-left mr-2" />
            Quay lại trang trước
          </button>
        </div>

        <div className="text-xs text-white/70">
          Mã lỗi: <span className="font-mono">404_NOT_FOUND</span>
        </div>
      </div>
    </div>
  );
}


