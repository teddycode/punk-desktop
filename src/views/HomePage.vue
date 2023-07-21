<template>
    <div class="main">
        <div class="search-bar">
            <div class="search-input">
                <input type="text" placeholder="搜索">
                <span class="search-icon"></span>
            </div>

            <button @click="search">搜索</button>
        </div>
        <section class="hero">
            <h1 class="hero-title">欢迎来到盘古</h1>
            <p class="hero-subtitle">盘古是一款网络空间中陌生主体之间去信任协作的操作系统</p>
            <button class="hero-button" @click="explore">探索更多</button>
        </section>
        <router-view></router-view>
        <section class="summary">
            <div class="summary-container">
                <div class="summary-item">
                    <h2 class="summary-title">当前交易总数</h2>
                    <p class="summary-content">{{ totalTransactions }}</p>
                </div>
                <div class="summary-item">
                    <h2 class="summary-title">当前区块高度</h2>
                    <p class="summary-content">{{ currentBlockHeight }}</p>
                </div>
            </div>
        </section>
        <section class="features">
            <div class="feature-container">
                <div class="feature" v-for="feature in features.slice(0,2)" :key="feature.id" @click="goToFeature(feature)">
                    <div class="feature-content">
                        <img src="../assets/2.jpeg" :alt="feature.image" class="feature-image">
                        <hr class="feature-line">
                        <h2 class="feature-title">{{ feature.title }}</h2>
                        <p class="feature-description">{{ feature.description }}</p>
                    </div>
                </div>
            </div>
        </section>
        <section class="features">
            <div class="feature-container">
                <div class="feature" v-for="feature in features.slice(2,4)" :key="feature.id" @click="goToFeature(feature)">
                    <div class="feature-content">
                        <img src="../assets/2.jpeg" :alt="feature.image" class="feature-image">
                        <hr class="feature-line">
                        <h2 class="feature-title">{{ feature.title }}</h2>
                        <p class="feature-description">{{ feature.description }}</p>
                    </div>
                </div>
            </div>
        </section>

        <section class="features">
            <div class="feature-container">
                <div class="feature" v-for="feature in features.slice(4,6)" :key="feature.id" @click="goToFeature(feature)">
                    <div class="feature-content">
                        <img src="../assets/2.jpeg" :alt="feature.image" class="feature-image">
                        <hr class="feature-line">
                        <h2 class="feature-title">{{ feature.title }}</h2>
                        <p class="feature-description">{{ feature.description }}</p>
                    </div>
                </div>
            </div>
        </section>
        <section class="features">
            <div class="feature-container">
                <div class="feature" v-for="feature in features.slice(6,8)" :key="feature.id" @click="goToFeature(feature)">
                    <div class="feature-content">
                        <img src="../assets/2.jpeg" :alt="feature.image" class="feature-image">
                        <hr class="feature-line">
                        <h2 class="feature-title">{{ feature.title }}</h2>
                        <p class="feature-description">{{ feature.description }}</p>
                    </div>
                </div>
            </div>
        </section>
    </div>

</template>

<script>
export default {
    name: 'HomePage',
    data() {
        return {
            isSearchActive:false,
            features: [
                {
                    id: 1,
                    title: '交易',
                    description: '关于交易的描述.',
                    image: '../assets/1.jpg'
                },
                {
                    id: 2,
                    title: '转账',
                    description: '关于转账的描述.',
                    image: '../assets/1.jpg',
                },
                {
                    id: 3,
                    title: '藏品',
                    description: '关于藏品的描述..',
                    image: './assets/evm.jpg'
                },
                {
                    id: 4,
                    title: '网络',
                    description: '关于网络的描述.',
                    image: './assets/evm.jpg'
                },
                {
                    id: 5,
                    title: '治理',
                    description: '关于治理的描述..',
                    image: './assets/evm.jpg'
                },
                {
                    id: 6,
                    title: '共识',
                    description: '关于共识的描述.',
                    image: './assets/evm.jpg'
                },
                {
                    id: 7,
                    title: '计算',
                    description: '关于计算的描述.',
                    image: './assets/evm.jpg'
                },
                {
                    id: 8,
                    title: '存储',
                    description: '关于存储的描述.',
                    image: './assets/evm.jpg'
                },
            ],
            totalTransactions: '2,100M',
            currentBlockHeight: '5761',
        }
    },
    methods: {
        explore() {
            // 处理点击“Explore Ethereum”按钮的逻辑
        },
        goToFeature(feature) {
            if (feature.title === '共识') {
                this.$router.push('myConsensus');
            } else if (feature.title === '存储') {
                this.$router.push('/myStorage');
            } else if (feature.title === '计算') {
                this.$router.push('/myCalculation');
            } else if (feature.title === '交易') {
                this.$router.push('/myTransaction');
            } else if (feature.title === '转账') {
                this.$router.push('/myTransfer');
            } else if (feature.title === '治理') {
                this.$router.push('/myGovernance');
            } else if (feature.title === '网络') {
                this.$router.push('/myNetwork');
            } else if (feature.title === '藏品') {
                this.$router.push('/myCollection');
            }
        },
        activateSearch() {
            this.isSearchActive = true;
        },
        deactivateSearch() {
            this.isSearchActive = false;
        },
        search() {
            // 处理搜索逻辑
        },

    }
}
</script>

<style>

.nav ul {
    list-style: none;
    padding: 0;
    margin: 0;
    display: flex;
    justify-content: center;
}

.nav li {
    margin-right: 20px;
}

.nav a {
    text-decoration: none;
    color: #fff;
    font-size: 16px;
    transition: color 0.3s;
}

.nav a:hover {
    color: #ccc;
}

.nav .active a {
    color: #ccc;
}

.main {
    padding: 40px;
}
/* 组件的样式 */
.search-bar {
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

.search-input {
    display: flex;
    align-items: center;
    margin-right: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

.search-input input {
    padding: 8px;
    width: 300px;
    border: none;
}

.search-icon {
    display: inline-block;
    width: 16px;
    height: 16px;
    background-image: url(../assets/search.jpg);
    background-size: cover;
    margin: 0 8px;
}

.search-bar button {
    padding: 8px 16px;
    background-color: #3aafa9;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.search-bar button:hover {
    background-color: #1f7d79;
}
.hero-title {
    font-size: 36px;
    font-weight: bold;
    margin-bottom: 20px;
}

.hero-subtitle {
    font-size: 24px;
    color: #888;
    margin-bottom: 40px;
}

.hero-button {
    background-color: #3aafa9;
    color: #fff;
    font-size: 18px;
    padding: 12px 24px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.hero-button:hover {
    background-color: #1f7d79;
}
.summary-container {
    display: flex;
    justify-content: center;
    max-width: 1100px;
    margin: 0 auto;
    padding: 20px 20px;
}

.summary-item {
    flex: 0 0 48%;
    margin-bottom: 10px;
    background-color: #f8f8f8;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
    cursor: pointer;
    text-align: center;
    padding: 20px;
}

.summary-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.summary-content {
    font-size: 24px;
    color: #888;
    margin-bottom: 10px;
}

.features {
    display: flex;
    justify-content: center;
    margin-top: 40px;
}

.feature-container {
    display: flex;
    justify-content: center;
    max-width: 1200px;
    margin: 0 auto;
    padding: 0 20px;
}

.feature {
    flex: 0 0 48%;
    margin-bottom: 40px;
    background-color: #f8f8f8;
    border-radius: 4px;
    overflow: hidden;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    transition: transform 0.3s;
    cursor: pointer;
}
.feature-line {
    border: none;
    border-top: 1px solid #ddd;
    margin: 10px 0;
}
.feature:hover {
    transform: translateY(-5px);
}

.feature-content {
    padding: 20px;

}

.feature-image {
    width: 100%;
    height: auto;
    margin-bottom: 20px;
}

.feature-title {
    font-size: 18px;
    font-weight: bold;
    margin-bottom: 10px;
}

.feature-description {
    font-size: 14px;
    color: #888;
}

.footer {
    background-color: #f8f8f8;
    padding: 20px;
    text-align: center;
    color: #888;
}
</style>
