<template>
    <div>
        <a-modal
        v-model:open="props.open"
        title="Confirm Proposal Creation"
        :confirm-loading="confirmLoading"
        @ok="handleOk"
        @cancel="handleCancel"
        >
            <p>Are you sure you want to create this proposal?</p>
        </a-modal>
    </div>
</template>
  
<script setup>
    import { ref } from 'vue';
    import { message } from 'ant-design-vue';

    // 接收父组件传递的属性
    const props = defineProps({
        open: {
            type: Boolean,
            required: true,
        },
    });

    // 定义事件向父组件传递数据
    const emit = defineEmits(['update:open', 'confirm']);

    // 加载状态
    const confirmLoading = ref(false);

    const success = () => {
        message.success('Create proposal successfully');
    };

    // 确认按钮逻辑
    const handleOk = () => {
        confirmLoading.value = true;
        setTimeout(() => {
            confirmLoading.value = false;
            emit('update:open', false); // 关闭 Modal
            emit('confirm'); // 通知父组件确认操作
            success();
        }, 1000); // 模拟延迟
    };

    // 取消按钮逻辑
    const handleCancel = () => {
        emit('update:open', false); // 仅关闭 Modal
    };
</script>
  