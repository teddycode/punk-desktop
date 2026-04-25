#!/usr/bin/env bash
# macOS 适配版 Solidity 合约部署脚本
# 兼容 macOS 的 date 命令和路径处理特性
set -euo pipefail

# 日志函数 - 适配 macOS date 命令格式
log() {
    local level="${1:-INFO}"
    local message="${2:-}"
    local timestamp
    # macOS 的 date 命令兼容格式
    timestamp=$(date -j "+%Y-%m-%d %H:%M:%S")
    echo "[$timestamp] [$level] $message"
}

# 错误处理函数
error_exit() {
    log "ERROR" "$1"
    exit 1
}

# 检查 forge 是否安装
check_forge() {
    if ! command -v forge &> /dev/null; then
        error_exit "未检测到 forge，请先安装 Foundry：https://book.getfoundry.sh/getting-started/installation"
    fi
    log "INFO" "Foundry forge 已安装，版本: $(forge --version | head -n1)"
}

# 定义需要部署的脚本列表
DEPLOY_SCRIPTS=(
    "punkos_transport/Manager.d.sol"
    "punkos_transport/ManagerAddSource.s.sol"
    "punkos_transport/PNK_Relay.d.sol"
    "punkos_transport/ManagerSetGenesis.s.sol"
)

# 部署合约核心函数
deploy_contracts() {
    # 检查 RPC URL
    if [ -z "${rpc_url:-}" ]; then
        error_exit "RPC URL 不能为空"
    fi

    log "INFO" "开始部署到 $env 环境"
    log "INFO" "使用 RPC URL: $rpc_url"

    # 遍历部署脚本
    for script in "${DEPLOY_SCRIPTS[@]}"; do
        # 检查脚本文件是否存在（macOS 路径兼容）
        if [ ! -f "$script" ]; then
            error_exit "部署脚本不存在: $(pwd)/$script"
        fi
        
        log "INFO" "正在部署: $script"

        # 执行部署命令 - 保留原逻辑，适配 macOS 环境变量传递
        DEPLOY_ENV="$env" \
        forge script "$script" \
            --rpc-url "$rpc_url" \
            --legacy \
            --broadcast \
            --with-gas-price 20000000000 || error_exit "部署 $script 失败"

        log "INFO" "部署 $script 完成"
    done

    log "INFO" "所有合约部署成功"
}

# 主函数
main() {
    # 检查 forge 环境
    check_forge

    # 获取环境参数（默认 dev）
    #local env="${1:-dev}"
    local env="${1:-test}"
    local rpc_url=""

    # 加载 .env 文件（macOS 兼容的 source 命令）
    if [ -f .env ]; then
        # shellcheck disable=SC1091
        source .env
        log "INFO" "已加载 .env 环境配置文件"
    fi

    # 处理命令行传入的 RPC URL（兼容 macOS 字符串替换）
    if [ $# -eq 2 ]; then
        rpc_url="${2//:/://}"
        log "INFO" "使用命令行传入的 RPC URL"
    fi

    # 根据环境自动匹配 RPC URL
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
                error_exit "不支持的环境: $env，支持的环境：dev/test/prod"
                ;;
        esac
        log "INFO" "使用 $env 环境默认的 RPC URL"
    fi

    # 最终检查 RPC URL
    if [ -z "$rpc_url" ]; then
        error_exit "未找到 $env 环境的 RPC URL，请检查 .env 文件配置"
    fi

    # 开始部署流程
    log "INFO" "==================== 部署流程启动 ===================="
    deploy_contracts
    log "INFO" "==================== 部署流程完成 ===================="
}

# 捕获中断信号（macOS 信号兼容）
trap 'error_exit "部署过程被用户中断（SIGINT/SIGTERM）"' SIGINT SIGTERM

# 执行主函数并传递所有参数
main "$@"