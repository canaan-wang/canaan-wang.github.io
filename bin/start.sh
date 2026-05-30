#!/bin/bash
# VitePress 开发服务器启动脚本（端口: 7154）

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
LOG_FILE="$PROJECT_DIR/.vitepress/dev-server.log"
PID_FILE="$PROJECT_DIR/.vitepress/dev-server.pid"
PORT=7154

# 确保 .vitepress 目录存在
mkdir -p "$PROJECT_DIR/.vitepress"

cd "$PROJECT_DIR" || exit 1

echo "正在启动 VitePress 开发服务器（端口: $PORT）..."
nohup npx vitepress dev --port "$PORT" > "$LOG_FILE" 2>&1 &
NEW_PID=$!
echo $NEW_PID > "$PID_FILE"

sleep 2

if kill -0 "$NEW_PID" 2>/dev/null; then
    echo "✅ 开发服务器已启动 (PID: $NEW_PID)"
    echo "🔗 本地访问地址: http://localhost:$PORT/"
    echo "📄 日志文件: $LOG_FILE"
    echo "📝 查看实时日志: tail -f $LOG_FILE"
    echo "🛑 停止服务器: kill \$(cat $PID_FILE)"
else
    echo "❌ 启动失败，请查看日志: $LOG_FILE"
    exit 1
fi
