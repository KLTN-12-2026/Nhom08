#!/bin/bash

# Script để restart Flutter app đúng cách
# Sử dụng: ./restart_app.sh

echo "🛑 Stopping current Flutter app..."
# Kill tất cả flutter processes
pkill -f "flutter_tools.snapshot run" 2>/dev/null
pkill -f "flutter run" 2>/dev/null

echo "⏳ Waiting for processes to stop..."
sleep 2

echo "🧹 Cleaning build (optional, bỏ comment nếu cần)..."
# flutter clean
# flutter pub get

echo "🚀 Starting Flutter app..."
flutter run

# Optional: Nếu muốn chạy trên device cụ thể
# flutter run -d <device_id>

# Optional: Nếu muốn chạy với hot reload enabled
# flutter run --hot
