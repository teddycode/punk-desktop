<template>
  <div class="test-center">
    <div class="header">
      <h1>🔗 钱包集成测试中心</h1>
      <p>逐步测试每个环境 | 点击卡片开始测试</p>
    </div>

    <div class="test-cards">
      <div 
        v-for="test in tests" 
        :key="test.id"
        :class="['test-card', test.status]"
        @click="navigateToTest(test)"
      >
        <div class="card-header">
          <span class="test-number">{{ test.id }}</span>
          <span class="test-icon">{{ test.icon }}</span>
        </div>
        <h3>{{ test.title }}</h3>
        <p>{{ test.description }}</p>
        <div class="card-footer">
          <span v-if="test.status === 'completed'" class="badge completed">✅ 已完成</span>
          <span v-else-if="test.status === 'ready'" class="badge ready">准备测试</span>
          <span v-else class="badge pending">待开发</span>
        </div>
      </div>
    </div>

    <div class="instructions">
      <h3>📋 测试说明</h3>
      <div class="instruction-grid">
        <div class="instruction-item">
          <span class="num">1</span>
          <span class="text">按数字顺序依次测试</span>
        </div>
        <div class="instruction-item">
          <span class="num">2</span>
          <span class="text">每个测试通过后再进行下一个</span>
        </div>
        <div class="instruction-item">
          <span class="num">3</span>
          <span class="text">点击卡片进入测试页面</span>
        </div>
        <div class="instruction-item">
          <span class="num">4</span>
          <span class="text">测试失败查看页面提示</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();

const tests = ref([
  {
    id: 1,
    icon: '🔧',
    title: '基础钱包服务',
    description: '验证插件注册和功能',
    route: '/test/wallet/basic',
    status: 'completed'  // 已完成
  },
  {
    id: 2,
    icon: '🚀',
    title: 'Splash.vue 环境',
    description: '测试应用启动钱包初始化',
    route: '/test/wallet/splash',
    status: 'completed'  // 已完成
  },
  {
    id: 3,
    icon: '🎨',
    title: 'Vue 组件环境',
    description: '测试普通组件使用钱包',
    route: '/test/wallet/component',
    status: 'ready'  // 准备测试
  },
  {
    id: 4,
    icon: '🌐',
    title: '内嵌浏览器环境',
    description: '测试 DApp 钱包自动连接',
    route: '/test/wallet/browser',
    status: 'completed'  // 已完成
  },
  {
    id: 5,
    icon: '🌉',
    title: 'iframe 桥接环境',
    description: '测试跨窗口钱包通信',
    route: '/test/wallet/iframe',
    status: 'completed'  // 已完成
  },
  {
    id: 6,
    icon: '📱',
    title: 'Dapp 详情页环境',
    description: '测试详情页钱包集成',
    route: '/test/wallet/dapp',
    status: 'completed'  // 已完成
  }
]);

const navigateToTest = (test) => {
  if (test.status === 'pending') {
    alert('该测试页面还未创建，请先完成前面的测试');
    return;
  }
  router.push(test.route);
};
</script>

<style scoped>
.test-center {
  height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 30px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.header {
  text-align: center;
  color: white;
  margin-bottom: 30px;
}

.header h1 {
  font-size: 32px;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.header p {
  margin: 0;
  opacity: 0.9;
  font-size: 14px;
}

.test-cards {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 20px;
  min-height: 0;
  margin-bottom: 20px;
}

.test-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
}

.test-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
}

.test-card.pending {
  opacity: 0.6;
  cursor: not-allowed;
}

.test-card.pending:hover {
  transform: none;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.test-number {
  width: 32px;
  height: 32px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 16px;
}

.test-icon {
  font-size: 36px;
}

.test-card h3 {
  font-size: 18px;
  color: #333;
  margin: 0 0 8px 0;
  font-weight: 600;
}

.test-card p {
  color: #666;
  font-size: 13px;
  line-height: 1.5;
  margin: 0;
  flex: 1;
}

.card-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
}

.badge {
  display: inline-block;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
}

.badge.completed {
  background: #f6ffed;
  color: #52c41a;
}

.badge.ready {
  background: #e6f7ff;
  color: #1890ff;
}

.badge.pending {
  background: #f0f0f0;
  color: #999;
}

.instructions {
  background: white;
  border-radius: 12px;
  padding: 20px;
}

.instructions h3 {
  margin: 0 0 15px 0;
  font-size: 18px;
  color: #333;
}

.instruction-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.instruction-item {
  display: flex;
  align-items: center;
  gap: 10px;
}

.instruction-item .num {
  width: 28px;
  height: 28px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  flex-shrink: 0;
}

.instruction-item .text {
  font-size: 13px;
  color: #666;
  line-height: 1.4;
}
</style>
