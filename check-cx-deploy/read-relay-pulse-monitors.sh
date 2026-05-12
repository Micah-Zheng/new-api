#!/bin/bash
# ============================================================
# 读取 relay-pulse monitors.d 配置并输出 check-cx SQL 片段
# 在服务器上运行：bash read-relay-pulse-monitors.sh
# ============================================================

MONITORS_DIR="/home/ubuntu/relay-pulse/config/monitors.d"

if [ ! -d "$MONITORS_DIR" ]; then
  echo "目录不存在: $MONITORS_DIR"
  exit 1
fi

echo "=== relay-pulse monitors.d 配置文件列表 ==="
ls -la "$MONITORS_DIR"

echo ""
echo "=== 各配置文件内容 ==="
for f in "$MONITORS_DIR"/*.yaml "$MONITORS_DIR"/*.yml; do
  [ -f "$f" ] || continue
  echo ""
  echo "--- 文件: $f ---"
  cat "$f"
done
