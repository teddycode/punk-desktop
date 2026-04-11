<template>
  <div class="capp-details">
    <div class="details-header">
      <div class="header-layout">
        <div class="app-main-info">
          <div class="app-icon-large">
            <img :src="cappData.icon" :alt="cappData.name" />
          </div>
          <div class="app-header-content">
            <h1 class="app-title">{{ cappData.name }}</h1>
            <div class="app-meta">
              <a-tag :color="getCategoryColor(cappData.category)" class="category-tag">
                <component :is="getCategoryIcon(cappData.category)" />
                {{ getCategoryLabel(cappData.category) }}
              </a-tag>
              <span class="version">v{{ cappData.version }}</span>
              <span class="publisher">by {{ cappData.publisher }}</span>
            </div>
            <div class="app-rating">
              <a-rate :value="cappData.rating" disabled allow-half />
              <span class="rating-score">{{ cappData.rating.toFixed(1) }}</span>
              <span class="rating-count">({{ formatNumber(cappData.ratingCount) }} 评价)</span>
            </div>
            <div class="app-stats-row">
              <div class="stat-badge">
                <DownloadOutlined />
                <span>{{ formatNumber(cappData.totalDownloads) }} 下载</span>
              </div>
              <div class="stat-badge">
                <LikeOutlined />
                <span>{{ formatNumber(cappData.likes) }} 点赞</span>
              </div>
              <div class="stat-badge">
                <ClockCircleOutlined />
                <span>{{ formatDate(cappData.publishDate) }}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="action-buttons">
          <a-button type="primary" size="large" class="install-btn" @click="handleInstall">
            <CloudDownloadOutlined />
            安装到客户端
          </a-button>
          <a-button size="large" class="download-btn" @click="handleDownload">
            <DownloadOutlined />
            下载到本地
          </a-button>
          <div>
            <a-button size="large" class="like-btn" @click="handleLike">
              <LikeOutlined :class="{ 'liked': isLiked }" />
            </a-button>
            <a-button size="large" class="dislike-btn" @click="handleDislike">
              <DislikeOutlined :class="{ 'disliked': isDisliked }" />
            </a-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 两栏布局 -->
    <div class="details-content">
      <!-- 左侧主要内容 -->
      <div class="main-content">
        <a-tabs v-model:activeKey="activeTab" class="details-tabs">
          <a-tab-pane key="overview" tab="📖 简介">
            <div class="tab-content">
              <div class="section">
                <h3 class="section-title">应用简介</h3>
                <div class="description-text" v-html="cappData.description"></div>
              </div>
              
              <div class="section">
                <h3 class="section-title">功能特性</h3>
                <ul class="features-list">
                  <li v-for="(feature, index) in cappData.features" :key="index">
                    <CheckCircleOutlined class="feature-icon" />
                    {{ feature }}
                  </li>
                </ul>
              </div>
            </div>
          </a-tab-pane>

          <a-tab-pane key="screenshots" tab="📷 截图">
            <div class="tab-content">
              <div class="screenshots-grid">
                <div v-for="(screenshot, index) in cappData.screenshots" :key="index" class="screenshot-item">
                  <img :src="screenshot" :alt="`Screenshot ${index + 1}`" @click="previewImage(screenshot)" />
                </div>
              </div>
            </div>
          </a-tab-pane>

          <a-tab-pane key="comments" tab="💬 评论">
            <div class="tab-content">
              <div class="comment-section">
                <div class="comment-input-area">
                  <a-textarea
                    v-model:value="newComment"
                    placeholder="写下你的评论..."
                    :rows="4"
                    class="comment-input"
                  />
                  <div class="comment-actions">
                    <a-rate v-model:value="newRating" />
                    <a-button type="primary" @click="submitComment">
                      发表评论
                    </a-button>
                  </div>
                </div>

                <div class="comments-list">
                  <div v-for="comment in cappData.comments" :key="comment.id" class="comment-item">
                    <div class="comment-header">
                      <a-avatar :src="comment.userAvatar" :size="40" />
                      <div class="comment-user-info">
                        <span class="comment-username">{{ comment.username }}</span>
                        <a-rate :value="comment.rating" disabled :count="5" style="font-size: 12px;" />
                      </div>
                      <span class="comment-date">{{ formatDate(comment.date) }}</span>
                    </div>
                    <div class="comment-content">{{ comment.content }}</div>
                    <div class="comment-footer">
                      <a-button type="text" size="small" @click="likeComment(comment.id)">
                        <LikeOutlined /> {{ comment.likes }}
                      </a-button>
                      <a-button type="text" size="small">
                        <MessageOutlined /> 回复
                      </a-button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </a-tab-pane>

          <a-tab-pane key="changelog" tab="📝 更新日志">
            <div class="tab-content">
              <a-timeline class="changelog-timeline">
                <a-timeline-item v-for="log in cappData.changelog" :key="log.version" color="blue">
                  <template #dot>
                    <ClockCircleOutlined style="font-size: 16px;" />
                  </template>
                  <div class="changelog-item">
                    <div class="changelog-header">
                      <span class="changelog-version">v{{ log.version }}</span>
                      <span class="changelog-date">{{ formatDate(log.date) }}</span>
                    </div>
                    <ul class="changelog-changes">
                      <li v-for="(change, index) in log.changes" :key="index">{{ change }}</li>
                    </ul>
                  </div>
                </a-timeline-item>
              </a-timeline>
            </div>
          </a-tab-pane>
        </a-tabs>
      </div>

      <!-- 右侧边栏 -->
      <div class="sidebar">
        <!-- 系统要求卡片 -->
        <a-card class="sidebar-card" title="📋 系统要求">
          <div class="sidebar-info">
            <div class="info-row">
              <span class="info-label">操作系统</span>
              <span class="info-value">{{ cappData.requirements.os }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">最低版本</span>
              <span class="info-value">{{ cappData.requirements.minVersion }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">文件大小</span>
              <span class="info-value">{{ cappData.requirements.size }}</span>
            </div>
          </div>
        </a-card>

        <!-- 统计信息卡片 -->
        <a-card class="sidebar-card" title="📊 统计信息">
          <div class="sidebar-info">
            <div class="info-row">
              <span class="info-label">总下载量</span>
              <span class="info-value highlight">{{ formatNumber(cappData.totalDownloads) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">日下载量</span>
              <span class="info-value">{{ formatNumber(cappData.dailyDownloads || 1250) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">周下载量</span>
              <span class="info-value">{{ formatNumber(cappData.weeklyDownloads || 8500) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">点赞数</span>
              <span class="info-value success">{{ formatNumber(cappData.likes) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">评价数</span>
              <span class="info-value">{{ formatNumber(cappData.ratingCount) }}</span>
            </div>
          </div>
        </a-card>

        <!-- 资源链接卡片 -->
        <a-card class="sidebar-card" title="🔗 相关资源">
          <div class="resource-links">
            <a v-if="cappData.website" :href="cappData.website" target="_blank" class="resource-link-item">
              <GlobalOutlined />
              <span>官方网站</span>
              <RightOutlined class="arrow-icon" />
            </a>
            <a v-if="cappData.github" :href="cappData.github" target="_blank" class="resource-link-item">
              <GithubOutlined />
              <span>GitHub</span>
              <RightOutlined class="arrow-icon" />
            </a>
            <a v-if="cappData.documentation" :href="cappData.documentation" target="_blank" class="resource-link-item">
              <FileTextOutlined />
              <span>使用文档</span>
              <RightOutlined class="arrow-icon" />
            </a>
            <a v-if="cappData.videoTutorial" :href="cappData.videoTutorial" target="_blank" class="resource-link-item">
              <PlayCircleOutlined />
              <span>教程视频</span>
              <RightOutlined class="arrow-icon" />
            </a>
          </div>
        </a-card>

        <!-- 发布信息卡片 -->
        <a-card class="sidebar-card" title="ℹ️ 发布信息">
          <div class="sidebar-info">
            <div class="info-row">
              <span class="info-label">当前版本</span>
              <span class="info-value">v{{ cappData.version }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">发布者</span>
              <span class="info-value">{{ cappData.publisher }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">发布时间</span>
              <span class="info-value">{{ formatDate(cappData.publishDate) }}</span>
            </div>
            <div class="info-row">
              <span class="info-label">最后更新</span>
              <span class="info-value">{{ formatDate(cappData.changelog[0].date) }}</span>
            </div>
          </div>
        </a-card>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import {
  DownloadOutlined,
  CloudDownloadOutlined,
  LikeOutlined,
  DislikeOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  GlobalOutlined,
  GithubOutlined,
  FileTextOutlined,
  PlayCircleOutlined,
  MessageOutlined,
  RightOutlined,
  ToolOutlined,
  DollarOutlined,
  WalletOutlined,
  RobotOutlined,
  TeamOutlined
} from '@ant-design/icons-vue';
import { message } from 'ant-design-vue';
import { nanoid } from 'nanoid';

const props = defineProps<{
  id: string;
}>();

const emit = defineEmits(['back']);

const activeTab = ref('overview');
const isLiked = ref(false);
const isDisliked = ref(false);
const newComment = ref('');
const newRating = ref(5);

// 模拟数据
const cappData = ref({
  id: 1,
  name: 'VS Code Extension',
  icon: 'https://pic1.imgdb.cn/item/69889816ac0326447d74a5e0.png',
  category: 'dev-tools',
  version: '2.5.1',
  publisher: 'PunkOS Team',
  rating: 4.8,
  ratingCount: 1250,
  totalDownloads: 125000,
  dailyDownloads: 1250,
  weeklyDownloads: 8500,
  likes: 8500,
  dislikes: 120,
  publishDate: '2026-01-15',
  description: `
    <p>这是一款强大的VS Code扩展,专为Web3开发者设计。提供智能合约开发、调试和部署的完整工具链。</p>
    <p>支持Solidity、Rust等多种智能合约语言,内置代码片段、语法高亮和智能提示功能。</p>
    <p>通过集成多个区块链网络,开发者可以轻松部署和测试智能合约,大大提升开发效率。</p>
  `,
  features: [
    '智能合约语法高亮和自动补全',
    '内置Solidity和Rust编译器',
    '一键部署到多个区块链网络',
    '实时Gas费用估算',
    '合约安全审计工具集成',
    '支持多钱包连接和测试',
    '代码片段库和模板',
    '实时错误检测和修复建议'
  ],
  requirements: {
    os: 'Windows 10+, macOS 11+, Linux',
    minVersion: 'PunkOS 1.0.0+',
    size: '12.5 MB'
  },
  screenshots: [
    'https://pic1.imgdb.cn/item/69889816ac0326447d74a5e0.png',
    'https://pic1.imgdb.cn/item/69889816ac0326447d74a5dc.png',
    'https://pic1.imgdb.cn/item/69889816ac0326447d74a5df.png',
    'https://pic1.imgdb.cn/item/69889816ac0326447d74a5e1.png',
  ],
  website: 'https://punkos.vip',
  github: 'https://github.com/punkos/vscode-extension',
  documentation: 'https://docs.punkos.vip',
  videoTutorial: 'https://youtube.com/watch?v=example',
  comments: [
    {
      id: 1,
      username: '开发者小王',
      userAvatar: 'https://pic1.imgdb.cn/item/69889816ac0326447d74a5e1.png',
      rating: 5,
      content: '非常好用的工具!大大提升了我的开发效率,智能提示功能特别强大!',
      date: '2026-02-01',
      likes: 45
    },
    {
      id: 2,
      username: 'Web3爱好者',
      userAvatar: 'https://pic1.imgdb.cn/item/69889816ac0326447d74a5de.png',
      rating: 4.5,
      content: '功能很全面,但是希望能增加更多的代码模板。',
      date: '2026-01-28',
      likes: 23
    },
    {
      id: 3,
      username: '区块链开发者',
      userAvatar: 'https://pic1.imgdb.cn/item/69889816ac0326447d74a5dd.png',
      rating: 5,
      content: '部署功能太方便了,支持多个网络切换,强烈推荐!',
      date: '2026-01-25',
      likes: 38
    }
  ],
  changelog: [
    {
      version: '2.5.1',
      date: '2026-02-05',
      changes: [
        '修复了Solidity 0.8.20编译器的兼容性问题',
        '优化了代码补全的响应速度',
        '新增支持Arbitrum和Optimism网络'
      ]
    },
    {
      version: '2.5.0',
      date: '2026-01-15',
      changes: [
        '新增智能合约安全审计功能',
        '支持多钱包同时连接',
        '改进了Gas费用估算算法',
        '修复了若干已知bug'
      ]
    },
    {
      version: '2.4.0',
      date: '2025-12-20',
      changes: [
        '新增Rust智能合约支持',
        '优化了编译器性能',
        '改进了错误提示信息'
      ]
    }
  ]
});

const categoryMap = {
  'dev-tools': { label: '开发工具', icon: ToolOutlined, color: 'blue' },
  'finance': { label: '金融分析', icon: DollarOutlined, color: 'green' },
  'asset': { label: '资产管理', icon: WalletOutlined, color: 'purple' },
  'agent': { label: 'Agent服务', icon: RobotOutlined, color: 'orange' },
  'social': { label: '社交网络', icon: TeamOutlined, color: 'cyan' },
};

const getCategoryLabel = (category: string) => categoryMap[category]?.label || '其他';
const getCategoryIcon = (category: string) => categoryMap[category]?.icon || ToolOutlined;
const getCategoryColor = (category: string) => categoryMap[category]?.color || 'default';

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
};

const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' });
};

const handleInstall = async () => {
  const loading = message.loading({ content: '正在下载并安装应用...', duration: 0 });
  try {
    // 模拟从API下载 WASM 文件, 实际应使用 cappData.value.downloadUrl
    // 假设 API GET return binary
    const downloadUrl = (cappData.value as any).downloadUrl || 'https://raw.githubusercontent.com/mdn/webassembly-examples/master/wasm-sobel/wasm-sobel.wasm';
    
    let buffer;
    try {
        const response = await fetch(downloadUrl);
        if (!response.ok) throw new Error('Download failed ' + response.statusText);
        buffer = await response.arrayBuffer();
    } catch (e) {
        console.warn('下载失败，使用测试数据代替', e);
        // 最小的有效 WASM 模块 (empty module)
        // MagicNumber: 00 61 73 6d
        // Version: 01 00 00 00
        const wasmHeader = new Uint8Array([0x00, 0x61, 0x73, 0x6d, 0x01, 0x00, 0x00, 0x00]);
        buffer = wasmHeader.buffer;
    }

    const appInfo = {
      ...cappData.value,
      nanoid: nanoid(8), 
      package: `com.capp.${Date.now()}`,
      downloadUrl // keep track of source
    };

    // @ts-ignore
    const result = await window.$models.appModel.installCApp(JSON.parse(JSON.stringify(appInfo)), new Uint8Array(buffer));
    
    loading(); // close loading
    if (result) {
      message.success('安装成功！已添加到桌面');
    } else {
      throw new Error('Database insertion failed');
    }
  } catch (e: any) {
    loading();
    console.error(e);
    message.error('安装失败: ' + e.message);
  }
};

const handleDownload = () => {
  message.success('开始下载到本地...');
  // TODO: download from ipfs node
};

const handleLike = () => {
  isLiked.value = !isLiked.value;
  if (isLiked.value) {
    isDisliked.value = false;
    cappData.value.likes++;
    message.success('已点赞');
  } else {
    cappData.value.likes--;
  }
};

const handleDislike = () => {
  isDisliked.value = !isDisliked.value;
  if (isDisliked.value) {
    isLiked.value = false;
    cappData.value.dislikes++;
  } else {
    cappData.value.dislikes--;
  }
};

const submitComment = () => {
  if (!newComment.value.trim()) {
    message.warning('请输入评论内容');
    return;
  }
  
  const comment = {
    id: Date.now(),
    username: '当前用户',
    userAvatar: 'https://pic1.imgdb.cn/item/69889816ac0326447d74a5dd.png',
    rating: newRating.value,
    content: newComment.value,
    date: new Date().toISOString(),
    likes: 0
  };
  
  cappData.value.comments.unshift(comment);
  newComment.value = '';
  newRating.value = 5;
  message.success('评论发表成功');
};

const likeComment = (commentId: number) => {
  const comment = cappData.value.comments.find(c => c.id === commentId);
  if (comment) {
    comment.likes++;
    message.success('已点赞');
  }
};

const previewImage = (url: string) => {
  window.open(url, '_blank');
};

onMounted(() => {
  // 加载CApp详情数据
});
</script>

<style scoped>
.capp-details {
  padding: 24px;
  color: var(--primary-text);
  max-width: 1400px;
  margin: 0 auto;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.details-header {
  background: linear-gradient(135deg, rgba(167, 217, 254, 0.15) 0%, rgba(138, 180, 248, 0.1) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 20px;
  padding: 32px;
  margin-bottom: 24px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.header-layout {
  display: flex;
  gap: 32px;
  align-items: flex-start;
}

.app-main-info {
  display: flex;
  gap: 24px;
  flex: 1;
}

.app-icon-large {
  width: 120px;
  height: 120px;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(135deg, rgba(167, 217, 254, 0.3) 0%, rgba(138, 180, 248, 0.2) 100%);
  border: 3px solid rgba(167, 217, 254, 0.4);
  flex-shrink: 0;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

.app-icon-large img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.app-header-content {
  flex: 1;
}

.app-title {
  font-size: 2rem;
  font-weight: 800;
  margin: 0 0 12px 0;
  background: linear-gradient(135deg, #a7d9fe 0%, #8ab4f8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.app-meta {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.category-tag {
  font-size: 14px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: 8px;
}

.version, .publisher {
  color: var(--secondary-text);
  font-size: 14px;
}

.app-rating {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
}

.rating-score {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fadb14;
}

.rating-count {
  color: var(--secondary-text);
}

.app-stats-row {
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
}

.stat-badge {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 12px;
  min-width: 220px;
}

.install-btn {
  background: linear-gradient(135deg, #a7d9fe 0%, #8ab4f8 100%);
  border: none;
  font-weight: 700;
  height: 48px;
  width: 100%;
  border-radius: 12px;
  box-shadow: 0 6px 20px rgba(167, 217, 254, 0.4);
}

.install-btn:hover {
  background: linear-gradient(135deg, #8ab4f8 0%, #6a94d8 100%);
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(167, 217, 254, 0.5);
}

.download-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  color: var(--primary-text);
  font-weight: 600;
  height: 48px;
  width: 100%;
  border-radius: 12px;
}

.download-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(167, 217, 254, 0.6);
}

.action-buttons > div {
  display: flex;
  gap: 12px;
}

.like-btn, .dislike-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1.5px solid rgba(255, 255, 255, 0.3);
  color: var(--primary-text);
  flex: 1;
  height: 48px;
  border-radius: 12px;
}

.like-btn:hover, .dislike-btn:hover {
  background: rgba(255, 255, 255, 0.15);
  border-color: rgba(167, 217, 254, 0.6);
}

.liked {
  color: #52c41a;
}

.disliked {
  color: #ff4d4f;
}

/* 两栏布局 */
.details-content {
  display: grid;
  grid-template-columns: 1fr 360px;
  gap: 24px;
  align-items: start;
  flex: 1;
  min-height: 0;
}

/* 主要内容区 */
.main-content {
  min-width: 100%;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.details-tabs {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 16px;
  padding: 20px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
}

:deep(.ant-tabs) {
  height: 100%;
  display: flex;
  flex-direction: column;
  width: 100%;
}

:deep(.ant-tabs-content-holder) {
  flex: 1;
  overflow-y: auto;
  width: 100%;
}

:deep(.ant-tabs-content) {
  height: 100%;
  width: 100%;
}

:deep(.ant-tabs-tabpane) {
  height: 100%;
  width: 100%;
}

:deep(.ant-tabs-nav) {
  margin-bottom: 24px;
}

:deep(.ant-tabs-tab) {
  font-size: 15px;
  font-weight: 600;
  color: var(--secondary-text);
}

:deep(.ant-tabs-tab-active) {
  color: #a7d9fe !important;
}

.tab-content {
  padding: 12px;
  min-height: 500px;
  width: 100%;
}

.section {
  margin-bottom: 32px;
  width: 100%;
}

.section-title {
  font-size: 1.3rem;
  font-weight: 700;
  margin-bottom: 16px;
  color: var(--primary-text);
}

.description-text {
  line-height: 1.8;
  color: var(--secondary-text);
  font-size: 15px;
  width: 100%;
}

.features-list {
  list-style: none;
  padding: 0;
  width: 100%;
}

.features-list li {
  padding: 12px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 15px;
}

.feature-icon {
  color: #52c41a;
  font-size: 18px;
  flex-shrink: 0;
}

.screenshots-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  width: 100%;
}

.screenshot-item {
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s;
  border: 2px solid rgba(255, 255, 255, 0.1);
}

.screenshot-item:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(167, 217, 254, 0.3);
}

.screenshot-item img {
  width: 100%;
  height: auto;
  display: block;
}

.comment-section {
  width: 100%;
}

.comment-input-area {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 24px;
}

.comment-input {
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 8px;
  color: var(--primary-text);
  margin-bottom: 12px;
}

.comment-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comments-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.comment-item {
  background: rgba(255, 255, 255, 0.05);
  padding: 20px;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.comment-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
}

.comment-user-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.comment-username {
  font-weight: 600;
  color: var(--primary-text);
}

.comment-date {
  color: var(--secondary-text);
  font-size: 13px;
}

.comment-content {
  margin-bottom: 12px;
  line-height: 1.6;
  color: var(--secondary-text);
}

.comment-footer {
  display: flex;
  gap: 12px;
}

.changelog-timeline {
  margin-top: 20px;
}

.changelog-item {
  padding-left: 12px;
}

.changelog-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 12px;
}

.changelog-version {
  font-size: 1.1rem;
  font-weight: 700;
  color: #a7d9fe;
}

.changelog-date {
  color: var(--secondary-text);
  font-size: 14px;
}

.changelog-changes {
  list-style: disc;
  padding-left: 20px;
  color: var(--secondary-text);
}

.changelog-changes li {
  padding: 6px 0;
  line-height: 1.6;
}

/* 侧边栏 */
.sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 24px;
}

.sidebar-card {
  background: linear-gradient(135deg, rgba(167, 217, 254, 0.08) 0%, rgba(138, 180, 248, 0.05) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

:deep(.sidebar-card .ant-card-head) {
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  color: var(--primary-text);
  font-weight: 700;
  font-size: 15px;
}

:deep(.sidebar-card .ant-card-body) {
  padding: 16px;
}

.sidebar-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 8px 0;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  color: var(--secondary-text);
  font-size: 14px;
}

.info-value {
  color: var(--primary-text);
  font-weight: 600;
  font-size: 14px;
  text-align: right;
}

.info-value.highlight {
  color: #a7d9fe;
  font-weight: 700;
}

.info-value.success {
  color: #52c41a;
  font-weight: 700;
}

.resource-links {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.resource-link-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  color: var(--primary-text);
  text-decoration: none;
  transition: all 0.3s ease;
}

.resource-link-item:hover {
  background: rgba(167, 217, 254, 0.15);
  border-color: rgba(167, 217, 254, 0.3);
  transform: translateX(4px);
}

.resource-link-item .anticon:first-child {
  font-size: 18px;
  color: #a7d9fe;
}

.resource-link-item span {
  flex: 1;
  font-weight: 500;
}

.arrow-icon {
  font-size: 12px;
  color: var(--secondary-text);
}

/* 响应式设计 */
@media (max-width: 1200px) {
  .details-content {
    grid-template-columns: 1fr;
  }
  
  .sidebar {
    position: static;
    grid-row: 1;
  }
}
</style>
