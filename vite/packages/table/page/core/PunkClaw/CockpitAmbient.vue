<template>
  <div class="cockpit-ambient" aria-hidden="true">
    <div class="cockpit-ambient__glow" />
    <div class="cockpit-ambient__grid" />
    <div class="cockpit-ambient__ring" />
    <div class="cockpit-ambient__horizon" />
    <div class="cockpit-ambient__hint">
      <span class="cockpit-ambient__hint-title">预览窗口</span>
      <span class="cockpit-ambient__hint-sub">中央为当前页面实时预览，可继续操作；四周为 Agent 仪表与指令</span>
    </div>
  </div>
</template>

<script setup lang="ts"></script>

<style scoped>
.cockpit-ambient {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  top: 10px;
  overflow: hidden;
  pointer-events: none;
}
.cockpit-ambient__glow {
  position: absolute;
  inset: -20%;
  background: radial-gradient(ellipse 55% 45% at 50% 38%, rgba(0, 180, 255, 0.14) 0%, transparent 62%),
    radial-gradient(ellipse 40% 35% at 70% 55%, rgba(120, 80, 255, 0.08) 0%, transparent 55%);
}
.cockpit-ambient__grid {
  position: absolute;
  inset: 0;
  opacity: 0.35;
  background-image: linear-gradient(rgba(0, 200, 255, 0.07) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0, 200, 255, 0.07) 1px, transparent 1px);
  background-size: 48px 48px;
  mask-image: radial-gradient(ellipse 70% 60% at 50% 45%, black 20%, transparent 72%);
}
.cockpit-ambient__ring {
  position: absolute;
  left: 50%;
  top: 42%;
  width: min(72vw, 720px);
  height: min(72vw, 720px);
  transform: translate(-50%, -50%);
  border-radius: 50%;
  border: 1px solid rgba(0, 200, 255, 0.12);
  box-shadow: 0 0 60px rgba(0, 200, 255, 0.06), inset 0 0 80px rgba(0, 40, 80, 0.25);
  opacity: 0.55;
}
.cockpit-ambient__horizon {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 38%;
  background: linear-gradient(to top, rgba(4, 10, 24, 0.85) 0%, transparent 100%);
  pointer-events: none;
}
.cockpit-ambient__hint {
  position: absolute;
  left: 50%;
  bottom: 14%;
  transform: translateX(-50%);
  text-align: center;
  max-width: min(420px, 86vw);
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: 10px 16px;
  border-radius: 10px;
  background: rgba(6, 14, 28, 0.45);
  border: 1px solid rgba(0, 200, 255, 0.12);
  backdrop-filter: blur(8px);
}
.cockpit-ambient__hint-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: rgba(79, 195, 247, 0.95);
  text-transform: uppercase;
}
.cockpit-ambient__hint-sub {
  font-size: 11px;
  line-height: 1.45;
  color: rgba(224, 247, 255, 0.42);
}
</style>
