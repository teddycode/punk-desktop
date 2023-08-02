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
/*.content {*/
/*    flex: 1;*/
/*}*/
/*.header {*/
/*    background-color: #383b47;*/
/*    padding: 20px;*/
/*    display: flex;*/
/*    align-items: center;*/
/*    position: relative;*/
/*    !*justify-content: space-between;*!*/
/*}*/

/*.logo {*/
/*    width: 100px;*/
/*    height: auto;*/
/*    padding-right: 20px;*/
/*}*/

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
/*.wallet {*/
/*    position: absolute; !* 设置为绝对定位 *!*/
/*    top: 50%;           !* 顶部偏移50%，使其垂直居中 *!*/
/*    right: 50px;        !* 右侧偏移20px *!*/
/*    transform: translateY(-50%); !* 通过上下移动-50%来纠正垂直位置 *!*/
/*}*/
/*.wallet-btn {*/
/*    padding: 10px 20px;*/
/*    border-radius: 50px;*/
/*    background-color: #4caf50;*/
/*    color: white;*/
/*    border: none;*/
/*    cursor: pointer;*/
/*    transition: background-color 0.3s;*/
/*}*/

/*.wallet-btn:hover {*/
/*    background-color: #45a049;*/
/*}*/

/*.wallet-icon {*/
/*    width: 20px;*/
/*    height: 20px;*/
/*    margin-right: 10px;*/
/*    vertical-align: middle;*/
/*}*/
/*.help-box {*/
/*    position: fixed;*/
/*    top: 50%;*/
/*    right: 0;*/
/*    transform: translateY(-50%);*/
/*    padding: 10px;*/
/*    background-color: #3aafa9;*/
/*    border: 1px solid #ccc;*/
/*    border-radius: 4px;*/
/*    cursor: pointer;*/
/*    transition: right 0.3s;*/
/*}*/

/*.help-box.float-left {*/
/*    right: 20px;*/
/*}*/

/*.help-text {*/
/*    color: #fff;*/
/*}*/

/*.footer {*/
/*    display: grid;*/
/*    background-color: #f8f8f8;*/
/*    padding: 20px;*/
/*    text-align: center;*/
/*    color: #888;*/
/*;*/
/*}*/

</style>

