export default {
  // 钱包列表字段
  walletColumn: [
    {
      title: '序号',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '账户别名',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '账户地址',
      dataIndex: 'address',
      key: 'address',
    },
    {
      title: '币种符号',
      dataIndex: 'symbol',
      key: 'symbol',
    },
    {
      title: '资产数额',
      key: 'balance',
      dataIndex: 'balance',
    },
    {
      title: '账户类型',
      key: 'type',
      dataIndex: 'type',
    },
    {
      title: '账户状态',
      key: 'status',
      dataIndex: 'status',
    },
    {
      title: '操作',
      key: 'action',
    },
  ],
  transactionColumn: [
    {
      title: '主键',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: '代币符号',
      dataIndex: 'symbol',
      key: 'symbol',
      width: 100,
      align: 'center',
    },
    {
      title: '交易哈希',
      dataIndex: 'hash',
      key: 'hash',
      ellipsis: true,
    },
    {
      title: '区块高度',
      dataIndex: 'height',
      key: 'height',
    },
    {
      title: '付款方',
      key: 'from',
      dataIndex: 'from',
      ellipsis: true,
    },
    {
      title: '收款方',
      key: 'to',
      dataIndex: 'to',
      ellipsis: true,
    },
    {
      title: '交易类型',
      key: 'type',
      dataIndex: 'type',
    },
    {
      title: '数额',
      key: 'amount',
      dataIndex: 'amount',
    },
    {
      title: '费用',
      key: 'fee',
      dataIndex: 'fee',
      ellipsis: true,
    },
    {
      title: '时间',
      key: 'timestamp',
      dataIndex: 'timestamp',
      ellipsis: true,
    },
    {
      title: '操作',
      key: 'action',
    },
  ],
};
