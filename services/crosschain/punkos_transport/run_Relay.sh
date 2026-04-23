#!/usr/bin/env bash
# macOS 适配版 中继脚本运行器 (BTC_Relay.s.sol)
# 兼容 macOS 命令特性，增强错误检测和用户体验
set -euo pipefail

# 日志函数 - 适配 macOS date 命令（添加 -j 参数）
log() {
    local level="${1:-INFO}"
    local message="${2:-}"
    local timestamp
    # macOS 专属：date 命令需要 -j 参数才能自定义格式化时间
    timestamp=$(date -j "+%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] [$level] $message"
}

# 错误处理函数
error_exit() {
    log "ERROR" "$1"
    exit 1
}

# 前置检查函数（macOS 环境专属）
pre_check() {
    # 1. 检查 forge 是否安装（Mac 专属安装指引）
    if ! command -v forge &> /dev/null; then
        error_exit "❌ macOS 未检测到 forge，请先安装 Foundry：
        安装命令（Mac）：curl -L https://foundry.paradigm.xyz | bash && foundryup"
    fi
    log "INFO" "✅ Foundry forge 已安装: $(forge --version | head -n1)"

    # 2. 检查 .env 文件是否存在
    if [ ! -f .env ]; then
        error_exit "❌ 未找到 .env 文件，请确认当前目录有配置文件（需包含 RPC URL 等关键配置）"
    fi
    log "INFO" "✅ 已找到 .env 配置文件，开始加载环境变量"

    # 3. 检查中继脚本文件是否存在
    if [ ! -f "$RELAY_SCRIPT" ]; then
        error_exit "❌ 中继脚本不存在: $(pwd)/$RELAY_SCRIPT，请检查文件路径是否正确"
    fi
    log "INFO" "✅ 找到中继脚本: $RELAY_SCRIPT"

    # 4. 检查 PYTHON_PATH 环境变量（s.sol 依赖）
    if [ -z "${PYTHON_PATH:-}" ]; then
        log "WARNING" "⚠️  未检测到 PYTHON_PATH 环境变量（.env 中未配置），若脚本依赖请补充配置"
    else
        # 验证 Python 路径有效性
        if [ ! -f "$PYTHON_PATH" ]; then
            error_exit "❌ PYTHON_PATH 配置无效: $PYTHON_PATH（文件不存在）"
        fi
        log "INFO" "✅ PYTHON_PATH 验证通过: $PYTHON_PATH"
    fi
}

# 定义要运行的中继脚本（保留你的选择：BTC_Relay.s.sol）
# RELAY_SCRIPT="script/SEP_Relay.s.sol"
RELAY_SCRIPT="punkos_transport/PNK_Relay.s.sol"

# 运行中继核心函数
run_relay() {
    # 检查 RPC URL
    if [ -z "${rpc_url:-}" ]; then
        error_exit "RPC URL 不能为空"
    fi

    log "INFO" "🚀 开始在 $env 环境运行中继脚本"
    log "INFO" "🔌 使用 RPC URL: $rpc_url"
    log "INFO" "📝 正在执行: $RELAY_SCRIPT"

    # 执行 forge script - 适配 macOS 环境变量传递，增加详细日志
    DEPLOY_ENV="$env" \
    PYTHON_PATH="${PYTHON_PATH:-}" \
    forge script "$RELAY_SCRIPT" \
        --rpc-url "$rpc_url" \
        --legacy \
        --broadcast \
        --with-gas-price 10000000000 \
        -vvvv || error_exit "运行 $RELAY_SCRIPT 失败"

    log "INFO" "✅ $RELAY_SCRIPT 执行完成"
}

# 主函数
main() {
    # 先执行 macOS 专属前置检查
    pre_check

    # 默认环境为 dev
    local env="${1:-test}" 
    # 定义变量用于接收 RPC
    local rpc_url=""

    # 加载 .env 文件（macOS 兼容的 source 命令）
    # shellcheck disable=SC1091
    source .env

    # 处理传入的第二个参数作为 RPC URL（兼容 macOS 字符串处理）
    if [ $# -ge 2 ]; then
        rpc_url="$2"
        log "INFO" "🔧 使用命令行传入的 RPC URL: $rpc_url"
    fi

    # 如果没有传入 RPC，根据环境自动获取
    if [ -z "$rpc_url" ]; then
        case "$env" in
            dev)
                rpc_url="${DEV_RPC_URL:-}"
                ;;
            test)
                rpc_url="${TEST_RPC_URL:-}"
                ;;
            prod)
                rpc_url="${PROD_RPC_URL:-}"
                ;;
            *)
                error_exit "❌ 不支持的环境: $env，仅支持 dev/test/prod"
                ;;
        esac
        log "INFO" "🔧 使用 $env 环境默认的 RPC URL"
    fi

    # 最终检查 RPC URL 有效性
    if [ -z "$rpc_url" ]; then
        error_exit "❌ 未找到 $env 环境的 RPC URL，请检查 .env 文件中 DEV/TEST/PROD_RPC_URL 配置"
    fi

    # 启动中继流程
    log "INFO" "==================== 中继流程启动 ===================="
    run_relay
    log "INFO" "==================== 中继流程结束 ===================="
}

# 捕获 macOS 中断信号（SIGINT/SIGTERM），提示更友好
trap 'error_exit "⚠️  运行过程被用户中断（Ctrl+C）"' SIGINT SIGTERM

# 执行主函数并传递所有参数
main "$@"