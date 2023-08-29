<template>
    <div class="app">
        <router-view/>
    </div>
</template>

<script>
export default {
    name: 'App'

};
</script>

<style>
body, html {
    height: 100%;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
}
.app {
    font-family: Arial, sans-serif;
    text-align: center;
    position: relative;
    display: flex;
    flex-direction: column;
    flex: 1;
}

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


</style>

