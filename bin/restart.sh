#!/bin/bash
# VitePress 开发服务器重启脚本（端口: 7154）

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
PID_FILE="$PROJECT_DIR/.vitepress/dev-server.pid"

echo "检查是否有已运行的开发服务器..."
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE" 2>/dev/null)
    if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
        echo "发现已有进程 (PID: $OLD_PID)，正在停止..."
        kill "$OLD_PID" 2>/dev/null
        sleep 2
        echo "✅ 旧进程已停止"
    else
        echo "没有发现运行中的进程"
    fi
    rm -f "$PID_FILE"
else
    echo "没有发现运行中的进程"
fi

echo ""
# 调用 start.sh 重新启动
exec "$PROJECT_DIR/bin/start.sh"
