<script setup>
import { useRouter } from 'vue-router'
import WalletButton from '../components/WalletButton.vue'

const router = useRouter()

const stats = [
  { key: 'aum', label: 'Assets under management', value: '$41,885,192.06' },
  { key: 'proposals', label: 'Total proposals', value: '1' },
  { key: 'votes', label: 'Total votes', value: '8.5M' },
  { key: 'members', label: 'Members', value: '19' }
]

const topoRings = Array.from({ length: 30 }, (_, i) => 60 + i * 22)

const launch = () => router.push('/proposals')
</script>

<template>
  <main class="dao-home">
    <div class="page-card">
      <header class="topbar">
        <a class="brand" href="/" aria-label="Governance home">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" width="40" height="40">
              <circle cx="20" cy="20" r="19" fill="#1F1538" />
              <g fill="none" stroke="#E26B5C" stroke-width="1.3">
                <circle cx="20" cy="20" r="11.5" />
                <path d="M20 8.5 L20 31.5 M8.5 20 L31.5 20" />
                <path d="M12 12 L28 28 M28 12 L12 28" stroke-opacity="0.45" />
              </g>
              <g fill="#E26B5C">
                <circle cx="20" cy="8.5" r="2.4" />
                <circle cx="20" cy="31.5" r="2.4" />
                <circle cx="8.5" cy="20" r="2.4" />
                <circle cx="31.5" cy="20" r="2.4" />
                <circle cx="20" cy="20" r="2" />
              </g>
            </svg>
          </span>
          <span class="brand-name">Governance</span>
        </a>

        <nav class="topnav" aria-label="Primary">
          <span class="topnav__divider" aria-hidden="true"></span>
          <button class="navlink" type="button">
            Apps
            <svg viewBox="0 0 12 8" width="10" height="6" aria-hidden="true">
              <path d="M1 2 L6 6 L11 2" stroke="currentColor" stroke-width="1.7" fill="none"
                stroke-linecap="round" stroke-linejoin="round" />
            </svg>
          </button>
          <button class="navlink navlink--active" type="button" aria-current="page">DAO</button>
          <button class="navlink" type="button">Technology</button>
          <button class="navlink" type="button">Token</button>
          <button class="navlink" type="button">Contributors</button>
        </nav>

        <WalletButton />
      </header>

      <section class="hero">
        <svg class="hero-topo" viewBox="-700 -460 1400 920"
          preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
          <defs>
            <filter id="topoDisplace" x="-20%" y="-20%" width="140%" height="140%">
              <feTurbulence type="fractalNoise" baseFrequency="0.0045"
                numOctaves="2" seed="7" result="noise" />
              <feDisplacementMap in="SourceGraphic" in2="noise" scale="58"
                xChannelSelector="R" yChannelSelector="G" />
            </filter>
            <radialGradient id="topoFade" cx="50%" cy="50%" r="60%">
              <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0" />
              <stop offset="65%" stop-color="#FFFFFF" stop-opacity="0" />
              <stop offset="100%" stop-color="#FFFFFF" stop-opacity="1" />
            </radialGradient>
          </defs>
          <g filter="url(#topoDisplace)" fill="none" stroke="#D5DBE3" stroke-width="0.75">
            <circle v-for="r in topoRings" :key="r" cx="0" cy="0" :r="r" />
          </g>
          <rect x="-700" y="-460" width="1400" height="920" fill="url(#topoFade)" />
        </svg>

        <div class="hero-inner">
          <h1 class="hero-title">Join the community,<br />change the future.</h1>
          <p class="hero-sub">The token that gives you the power to bring about real change.</p>

          <div class="stats-card">
            <article class="stat" v-for="(s, i) in stats" :key="s.key"
              :class="{ 'stat--first': i === 0 }">
              <header class="stat-head">
                <span class="stat-icon" aria-hidden="true">
                  <svg v-if="s.key === 'aum'" viewBox="0 0 24 24" width="18" height="18"
                    fill="none" stroke="currentColor" stroke-width="1.7"
                    stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="12" cy="12" r="9" />
                    <path d="M14.6 9.4c-.5-1-1.5-1.6-2.6-1.6-1.6 0-2.6 1-2.6 2.2 0 2.7 5.2 1.6 5.2 4.3 0 1.2-1.1 2.3-2.6 2.3-1.1 0-2.1-.6-2.6-1.6" />
                    <path d="M12 6v2M12 16v2" />
                  </svg>
                  <svg v-else-if="s.key === 'proposals'" viewBox="0 0 24 24" width="18" height="18"
                    fill="none" stroke="currentColor" stroke-width="1.7"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M16.5 3.5l4 4-12 12-4.5.5.5-4.5z" />
                    <path d="M14 6l4 4" />
                  </svg>
                  <svg v-else-if="s.key === 'votes'" viewBox="0 0 24 24" width="18" height="18"
                    fill="none" stroke="currentColor" stroke-width="1.7"
                    stroke-linecap="round" stroke-linejoin="round">
                    <path d="M7 11v9H4v-9z" />
                    <path d="M7 11l3.4-6.4c.3-.6 1-.9 1.6-.6.9.4 1.5 1.3 1.5 2.4V10h5.4c1 0 1.8 1 1.6 2l-1.4 7c-.2 1-1 1.6-2 1.6H7" />
                  </svg>
                  <svg v-else viewBox="0 0 24 24" width="18" height="18"
                    fill="none" stroke="currentColor" stroke-width="1.7"
                    stroke-linecap="round" stroke-linejoin="round">
                    <circle cx="9" cy="8.2" r="3.3" />
                    <path d="M2.8 19.6c.6-3.4 3.1-5.2 6.2-5.2 3.1 0 5.6 1.8 6.2 5.2" />
                    <circle cx="17.2" cy="7" r="2.5" />
                    <path d="M15.6 14c2.7.3 4.6 2.1 5.2 5.2" />
                  </svg>
                </span>
                <span class="stat-label">{{ s.label }}</span>
              </header>
              <div class="stat-value">{{ s.value }}</div>
            </article>
          </div>

          <button class="btn-primary btn-launch" type="button" @click="launch">Join the DAO</button>
        </div>
      </section>
    </div>
  </main>
</template>

<style scoped>
.dao-home {
  min-height: 100vh;
  background: #DEE7DD;
  padding: 14px;
  display: flex;
  justify-content: center;
  font-family: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont,
    'Segoe UI', Roboto, sans-serif;
  color: #14233E;
}

.page-card {
  position: relative;
  width: 100%;
  max-width: 1640px;
  background: #FFFFFF;
  border-radius: 28px;
  padding: 28px 56px 96px;
  box-shadow: 0 1px 0 rgba(20, 20, 40, 0.04);
  overflow: hidden;
}

.topbar {
  position: relative;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 28px;
}

.brand {
  display: inline-flex;
  align-items: center;
  gap: 12px;
  text-decoration: none;
  color: inherit;
}

.brand-mark { display: inline-flex; }

.brand-name {
  font-weight: 800;
  letter-spacing: 0.16em;
  font-size: 18px;
  color: #14233E;
}

.topnav {
  display: flex;
  align-items: center;
  gap: 4px;
  flex: 1;
  margin-left: 4px;
}

.topnav__divider {
  width: 1px;
  height: 22px;
  background: #D7DCE3;
  margin: 0 14px 0 4px;
}

.navlink {
  background: transparent;
  border: 1.5px solid transparent;
  color: #14233E;
  font-family: inherit;
  font-weight: 600;
  font-size: 15px;
  padding: 9px 18px;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  transition: background-color 200ms ease, border-color 200ms ease, color 200ms ease;
}

.navlink:hover { background: #F4F5F7; }
.navlink:focus-visible { outline: 2px solid #5C46FF; outline-offset: 2px; }
.navlink--active { border-color: #14233E; }

.btn-primary {
  background: #5C46FF;
  color: #FFFFFF;
  font-family: inherit;
  font-weight: 700;
  font-size: 15px;
  border: none;
  border-radius: 14px;
  padding: 14px 22px;
  cursor: pointer;
  box-shadow: 0 6px 18px -10px rgba(92, 70, 255, 0.7);
  transition: background-color 200ms ease, transform 80ms ease, box-shadow 200ms ease;
}

.btn-primary:hover { background: #4A36F0; }
.btn-primary:active { transform: translateY(1px); }
.btn-primary:focus-visible { outline: 2px solid #14233E; outline-offset: 2px; }
.btn-primary:disabled { opacity: 0.7; cursor: progress; }

.btn-buy {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
}
.btn-buy__icon { display: inline-flex; }

.hero {
  position: relative;
  padding: 64px 0 0;
}

.hero-topo {
  position: absolute;
  inset: -40px 0 0 0;
  width: 100%;
  height: calc(100% + 40px);
  pointer-events: none;
  z-index: 0;
  opacity: 0.9;
}

.hero-inner {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.hero-title {
  margin: 32px 0 24px;
  text-align: center;
  font-weight: 800;
  font-size: clamp(40px, 6.4vw, 96px);
  line-height: 1.04;
  letter-spacing: -0.025em;
  color: #14233E;
}

.hero-sub {
  margin: 0 0 64px;
  text-align: center;
  font-size: 18px;
  font-weight: 400;
  color: #6E7A8C;
}

.stats-card {
  width: 100%;
  max-width: 1280px;
  background: #FFFFFF;
  border-radius: 18px;
  box-shadow:
    0 18px 50px -28px rgba(28, 36, 60, 0.18),
    0 2px 6px rgba(28, 36, 60, 0.04);
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  padding: 28px 16px;
}

.stat {
  padding: 8px 36px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  border-left: 1px solid #ECEEF2;
}

.stat--first { border-left: none; }

.stat-head {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #2A3548;
  font-size: 14px;
  font-weight: 500;
}

.stat-icon { color: #2A3548; display: inline-flex; }

.stat-label { white-space: nowrap; }

.stat-value {
  font-weight: 800;
  font-size: 36px;
  letter-spacing: -0.02em;
  color: #14233E;
}

.btn-launch {
  margin-top: 80px;
  padding: 18px 40px;
  font-size: 16px;
  border-radius: 14px;
}

@media (max-width: 1100px) {
  .page-card { padding: 24px 28px 72px; border-radius: 24px; }
  .stat { padding: 8px 22px; }
  .stat-value { font-size: 30px; }
}

@media (max-width: 860px) {
  .topnav { display: none; }
  .topbar { gap: 16px; justify-content: space-between; }
  .stats-card { grid-template-columns: repeat(2, 1fr); row-gap: 24px; }
  .stat:nth-child(2) { border-left: 1px solid #ECEEF2; }
  .stat:nth-child(3) { border-left: none; }
  .hero-sub { margin-bottom: 40px; }
  .btn-launch { margin-top: 56px; }
}

@media (max-width: 540px) {
  .dao-home { padding: 8px; }
  .page-card { padding: 18px 18px 56px; border-radius: 20px; }
  .brand-name { font-size: 16px; }
  .btn-buy { padding: 12px 16px; font-size: 14px; }
  .stats-card { grid-template-columns: 1fr; padding: 18px; }
  .stat { border-left: none !important; padding: 12px 8px; border-top: 1px solid #ECEEF2; }
  .stat:first-child { border-top: none; }
  .hero-title { font-size: 40px; }
}

@media (prefers-reduced-motion: reduce) {
  .navlink, .btn-primary { transition: none; }
}
</style>
