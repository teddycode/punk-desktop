import { createStore } from 'vuex'

export default createStore({
    state: {
        userAddress: '',
        userBalance: '0',
        userLoggedIn: false,
    },
    mutations: {
        updateUserAddress(state, address) {
            state.userAddress = address;
        },
        updateUserBalance(state, balance) {
            state.userBalance = balance;
        },
        setUserLoggedIn(state, loggedIn) {
            state.userLoggedIn = loggedIn;
        },
    },
    actions: {
        setAddress({ commit }, address) {
            commit('updateUserAddress', address);
        },
        setBalance({ commit }, balance) {
            commit('updateUserBalance', balance);
        },
        setLoggedIn({ commit }, loggedIn) {
            commit('setUserLoggedIn', loggedIn);
        },
    },
    getters: {
        userAddress: state => state.userAddress,
        userBalance: state => state.userBalance,
        userLoggedIn: state => state.userLoggedIn,
    },
})
