#!/bin/bash
# VitePress 开发服务器后台启动脚本

PROJECT_DIR="$(cd "$(dirname "$0")" && pwd)"
LOG_FILE="$PROJECT_DIR/.vitepress/dev-server.log"
PID_FILE="$PROJECT_DIR/.vitepress/dev-server.pid"

# 确保 .vitepress 目录存在
mkdir -p "$PROJECT_DIR/.vitepress"

# 如果已经有进程在运行，先杀掉
echo "检查是否有已运行的开发服务器..."
if [ -f "$PID_FILE" ]; then
    OLD_PID=$(cat "$PID_FILE" 2>/dev/null)
    if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
        echo "发现已有进程 (PID: $OLD_PID)，正在停止..."
        kill "$OLD_PID" 2>/dev/null
        sleep 2
    fi
fi

cd "$PROJECT_DIR" || exit 1

echo "正在启动 VitePress 开发服务器..."
nohup npx vitepress dev > "$LOG_FILE" 2>&1 &
NEW_PID=$!
echo $NEW_PID > "$PID_FILE"

sleep 2

if kill -0 "$NEW_PID" 2>/dev/null; then
    echo "✅ 开发服务器已启动 (PID: $NEW_PID)"
    # 提取并显示访问地址
    URL=$(grep -oE 'http://localhost:[0-9]+/' "$LOG_FILE" | tail -1)
    if [ -n "$URL" ]; then
        echo "🔗 本地访问地址: $URL"
    fi
    echo "📄 日志文件: $LOG_FILE"
    echo "📝 查看实时日志: tail -f $LOG_FILE"
    echo "🛑 停止服务器: kill \$(cat $PID_FILE)"
else
    echo "❌ 启动失败，请查看日志: $LOG_FILE"
    exit 1
fi
