import { createStore } from 'vuex';

export default createStore({
    state: {
        userAddress: '',
        userBalance: '0',
        userLoggedIn: false,
        transferRecords: [], // 添加转账记录数组
        proposals:[],
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
        addTransferRecord(state, record) { // 添加添加转账记录的 mutation
            state.transferRecords.push(record);
        },
        updateProposals(state, proposals){
            state.proposals = proposals;
        }
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
        }
    },
    getters: {
        userAddress: (state) => state.userAddress,
        userBalance: (state) => state.userBalance,
        userLoggedIn: (state) => state.userLoggedIn,
        transferRecords: (state) => state.transferRecords, // 添加获取转账记录的 getter
        proposals:(state)=> state.proposals,
    },
});
