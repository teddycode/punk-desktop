<template>
    <div class="network-container">
        <h1 class="network-title">网络设置</h1>
        <div class="network-setting-group">
            <label for="port" class="network-label">端口</label>
            <input id="port" v-model="port" class="network-input" type="number">
        </div>
        <div class="network-setting-group">
            <p class="network-setting-label">允许局域网接入</p>
            <input type="checkbox" v-model="allowLAN" class="network-switch">
        </div>
        <div class="network-setting-group">
            <p class="network-setting-label">系统代理</p>
            <input type="checkbox" v-model="systemProxy" class="network-switch">
        </div>
        <div class="network-setting-group">
            <p class="network-setting-label">TUN 模式</p>
            <input type="checkbox" v-model="tunMode" class="network-switch">
        </div>
        <div class="network-setting-group">
            <p class="network-setting-label">IPv6:</p>
            <input type="checkbox" v-model="ipv6" class="network-switch">
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            port: 8080,
            allowLAN: false,
            systemProxy: false,
            tunMode: false,
            ipv6: false,
        };
    },
};
</script>

<style scoped>
.network-container {
    padding: 2rem;
    background-color: #f3f4f6;
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    align-items: center;
}
.network-title {
    font-size: 1.875rem;
    margin-bottom: 2rem;
    text-align: center;
}
.network-setting-group {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    width: 100%;
    max-width: 500px;
}
.network-label, .network-setting-label {
    text-align: left;
}
.network-input {
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 0.25rem;
    width: 100%;
    max-width: 18.75rem;
}
.network-switch {
    width: 3.5rem;
    height: 2rem;
    background-color: red;
    border-radius: 1rem;
    position: relative;
    cursor: pointer;
    appearance: none;
    outline: none;
    transition: background-color 0.3s;
}
.network-switch:before {
    content: '';
    width: 1.5rem;
    height: 1.5rem;
    background-color: white;
    border-radius: 50%;
    position: absolute;
    top: 0.25rem;
    left: 0.25rem;
    transition: left 0.3s;
}
.network-switch:checked {
    background-color: #34D399;
}
.network-switch:checked:before {
    left: 1.75rem;
}
</style>
