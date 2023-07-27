<template>
    <button
        class="btn btn-moving-gradient btn-moving-gradient--blue"
        @click="isUserLoggedIn ? logout() : navigateToLogin()"
    >
        {{ isUserLoggedIn ? userName : '登录' }}
        <font-awesome-icon
            v-if="isUserLoggedIn"
            icon="sign-out-alt"
            class="logout-icon"
            @click="logout"
        />
    </button>
</template>


<script >
import axios from 'axios';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';
import {library} from "@fortawesome/fontawesome-svg-core";
import { ArrowDown } from '@element-plus/icons-vue'
library.add(faSignOutAlt);
export default {
    name: "loginButton",
    components:{
        ArrowDown
    },
    data() {
        return {
            isUserLoggedIn: false,
            userName: ''
        }
    },
    methods: {
        async getLoggedInUser() {
            const token = localStorage.getItem('token');
            if (!token) {
                this.isUserLoggedIn = false;
            } else {
                this.isUserLoggedIn = true;
                this.userName = localStorage.getItem('userName')
                console.log("username: " + this.userName)
                console.log("isLoggedIn!!!")
            }
        },
        navigateToLogin() {
            this.$router.push({name: 'myLogin'});
        },
        async logout() {
            // Make a request to your server to logout
            try {
                const response = await axios.post('http://localhost:8080', null, {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('token')}`
                    }
                });
                if (response.status === 200) {
                    localStorage.removeItem('token');
                    localStorage.removeItem('userName');
                    this.$store.commit('removeToken');
                    console.log("logout test:" + this.$store.state.token)
                    this.isUserLoggedIn = false;
                    this.userName = 'username';
                    this.$router.push({name: ''});
                }
            } catch(error) {
                console.error('An error occurred while logging out:', error);
            }
        },
    },
    mounted() {
        this.getLoggedInUser();
    }
}
</script>

<style scoped>
.btn {
    font-family: Arial, Helvetica, sans-serif;
    text-transform: uppercase;
    position: absolute;
    right: 170px;
    top: 20px;
    text-align: left;
}

.btn:hover .btn-slide-show-text1 {
    margin-left: 65px;
}

.btn-moving-gradient {
    height: 35px;
    font-weight: 600;
    color: rgb(255, 255, 255);
    cursor: pointer;
    border: medium none;
    background-size: 300% 100%;
    border-radius: 50px;
}

.btn-moving-gradient:hover {
    transition: all 0.5s ease-in-out 0s;
    background-position: 100% 0px;
}

.btn-moving-gradient--blue {
    background-image: linear-gradient(90deg, rgb(61, 135, 255), rgb(190, 61, 255), rgb(126, 61, 255), rgb(58, 134, 255));
    box-shadow: rgb(190, 61, 255) 0px 4px 15px 0px;
}
.logout-icon {
    margin-left: 10px;
    cursor: pointer;
}
</style>