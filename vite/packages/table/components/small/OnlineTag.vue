<template>
  <a-badge :numberStyle="{ width: '30px' }" color="#52c41a" status="success"></a-badge>
</template>

<script>
export default {
  name: 'OnlineTag',
};
</script>

<style lang="scss" scoped>
:deep(.ant-badge-status-dot) {
  width: 10px !important;
  height: 10px;
}
</style>
