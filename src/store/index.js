import { createStore } from 'vuex';

export default createStore({
    state: {
        userAddress: '',
        userBalance: '0',
        userLoggedIn: false,
        transferRecords: [], // 添加转账记录数组
        proposals:JSON.parse(localStorage.getItem('proposals')) || [],
        token: localStorage.getItem('token') || null,
        wallet:null,
        openedPages: [],
        currentPage: '',
    },
    mutations: {
        updateUserAddress(state, address) {
            state.userAddress = address;
            // localStorage.setItem('userAddress', address)
        },
        updateUserBalance(state, balance) {
            state.userBalance = balance;
            // localStorage.setItem('userBalance',balance)
        },
        setUserLoggedIn(state, loggedIn) {
            state.userLoggedIn = loggedIn;
            // localStorage.setItem('userLoggedIn', loggedIn)
        },
        addTransferRecord(state, record) { // 添加添加转账记录的 mutation
            state.transferRecords.push(record);
        },
        updateProposals(state, proposals){
            state.proposals = proposals;
        },
        SET_TOKEN(state, token) {
            state.token = token;
        },
        removeToken(state) {
            state.token = null;
            localStorage.removeItem('token');
        },
        ADD_PAGE(state, page) {
            state.openedPages.push(page);
        },
        REMOVE_PAGE(state, index) {
            state.openedPages.splice(index, 1);
        },
        setCurrentPage(state, page) {  // <-- 添加这一块
            state.currentPage = page;
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
        addTransferRecord({ commit }, record) { // 添加添加转账记录的 action
            commit('addTransferRecord', record);
        },
        setProposals({commit}, proposals){
            commit('updateProposals', proposals);
        },
        setToken({ commit }, token) {
            localStorage.setItem('token', token);
            commit('SET_TOKEN', token);
        },
        removeToken({ commit }) {
            localStorage.removeItem('token');
            commit('SET_TOKEN', null);
        },
        addPage({ commit }, page) {
            commit('ADD_PAGE', page);
        },
        removePage({ commit }, index) {
            commit('REMOVE_PAGE', index);
        },
    },
    getters: {
        userAddress: (state) => state.userAddress,
        userBalance: (state) => state.userBalance,
        userLoggedIn: (state) => state.userLoggedIn,
        transferRecords: (state) => state.transferRecords, // 添加获取转账记录的 getter
        proposals:(state)=> state.proposals,
        loggedIn(state) {
            return !!state.token;
        },
        token: state => state.token,
        openedPages: (state) => state.openedPages,
    },
});
