import { defineStore } from 'pinia';

interface UserInfoType {
  address: string;
  balance: string;
  wallet: any;
  transferRecords: any[];
  token: string;
  proposals: any[];
  isAuthenticated: boolean;
}

export const useUserStore = defineStore({
  id: 'user',
  state: (): UserInfoType => ({
    address: '',
    balance: '0',
    wallet: null,
    transferRecords: [] as any[],
    token: localStorage.getItem('token') || '',
    proposals: JSON.parse(localStorage.getItem('proposals') || '[]'),
    isAuthenticated: false,
  }),
  getters: {
    getShortAddress(): string {
      return this.address.slice(0, 4) + '...' + this.address.slice(-4);
    },
  },
  actions: {
    setAddress(address: string) {
      this.address = address;
    },
    setBalance(balance: string) {
      this.userBalance = balance;
    },
    setIsLogin(flag: boolean) {
      this.userLoggedIn = flag;
    },
    addTransferRecord(record: any) {
      this.transferRecords.push(record);
    },
    setToken(token: string) {
      localStorage.setItem('token', token);
      this.token = token;
    },
    removeToken() {
      localStorage.removeItem('token');
      this.token = '';
    },
    setAuthenticated(flag: boolean) {
      this.isAuthenticated = flag;
    },
  },
});
