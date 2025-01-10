<template>
    <a-modal
      v-model:open="props.open"
      title="Voting"
      :confirm-loading="confirmLoading"
      @ok="handleOk"
      @cancel="handleCancel"
    >
        <p style="font-size: 18px;font-weight: 500;">You have {{ userInfo.votingPower }} voting power.</p>
        <a-form layout="horizontal">
            <a-form-item label="Vote">
            <a-radio-group v-model:value="voteOption">
                <a-radio value="yes">Yes</a-radio>
                <a-radio value="no">No</a-radio>
            </a-radio-group>
            </a-form-item>
            <a-form-item label="Number of Votes">
                <a-input-number v-model:value="voteCount" :min="1" :max="props.userInfo.votingPower" />
            </a-form-item>
        </a-form>
    </a-modal>
</template>
  
<script setup>
    import { defineEmits, ref } from 'vue';
    import { message } from 'ant-design-vue';

    const voteOption = ref('yes');
    const voteCount = ref(1);
    const confirmLoading = ref(false);

    // 接收父组件传递的属性
    const props = defineProps({
        open: {
            type: Boolean,
            required: true,
        },
        userInfo: {
            type: Object,
            required: true,
        },
    });

    // 定义事件向父组件传递数据
    const emit = defineEmits(['update:open', 'confirm']);

    const success = () => {
        message.success('Vote successfully');
    };

    // 确认按钮逻辑
    const handleOk = () => {
        confirmLoading.value = true;
        setTimeout(() => {
            emit('update:open', false); // 关闭 Modal
            emit('confirm', { voteOption: voteOption.value, voteCount: voteCount.value }); // 通知父组件确认操作
            success();
            confirmLoading.value = false;
        }, 1000); // 模拟延迟
    };

    // 取消按钮逻辑
    const handleCancel = () => {
        emit('update:open', false); // 仅关闭 Modal
    };
</script>
  