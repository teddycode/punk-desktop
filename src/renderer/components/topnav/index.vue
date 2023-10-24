<template>
    <div class="navbar" >
        <ul>
            <li  @click="fullBox">
                <font-awesome-icon :icon="['fas', 'expand-arrows-alt']" style="color: white;"></font-awesome-icon>
            </li>
            <li  @click="changeLen">
                <font-awesome-icon :icon="['fas', 'language']"  style="color: white;"></font-awesome-icon>
            </li>
            <li @click="goHome">
                <font-awesome-icon :icon="['fas', 'home']"  style="color: white;"></font-awesome-icon>
            </li>
            <li>
                <font-awesome-icon :icon="['fas', 'arrow-right']"  style="color: white;"></font-awesome-icon>
            </li>
        </ul>
    </div>
</template>

<script>
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from '@fortawesome/fontawesome-svg-core'
import {faExpandArrowsAlt, faLanguage, faHome, faArrowRight} from '@fortawesome/free-solid-svg-icons'

library.add(faExpandArrowsAlt, faLanguage, faHome, faArrowRight)

export default {
    name: "topnav",
    computed: {
        FontAwesomeIcon
    },
    data() {
        return {
            flag : 0,
        }
    },
    methods: {
        fullBox() {
            if (window.electronAPI) {
                window.electronAPI.toggleFullScreen();
                if (this.flag===0){
                    document.body.style.overflow = "auto";
                    this.flag=1;
                }else if(this.flag===1){
                    document.body.style.overflow = "hidden";
                    this.flag=0;
                }
            }
        },
        changeLen() {
        },
        goHome() {
            this.$router.push({ path: "/" });
        },
        showResource(){

        }
    }
};
</script>

<style lang="scss" scoped>
.navbar {
    top: -80px;
    width: 200px;
    height: 50px;
    margin-bottom: 0;
    background: rgba(216, 191, 216, 0.2);
    border-radius: 0;
    border: none;
    margin-left: -170px;
    transition: margin-left 0.9s;
    ul {
        width: 100%;
        height: 100%;
        li {
            float: left;
            width: 40px;
            height: 100%;
            display: flex;
            justify-content: center;
            align-items: center;
            padding: 5px;
            &:focus {
                background: #3498da;
            }
            &:hover {
                background: #3498da;
            }
        }
    }
    &:hover {
        margin-left: -20px;
    }
}

</style>
