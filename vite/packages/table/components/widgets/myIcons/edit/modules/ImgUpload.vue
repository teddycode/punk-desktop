<template>
  <XtTitle> 图标</XtTitle>
  <div class="relative items-center">
    <a-upload
        :before-upload="beforeUpload"
        :show-upload-list="false"
        class="avatar-uploader relative"
        list-type="picture-card"
        name="avatar"
        style="border: 1px springgreen solid"
    >
      <img
          v-if="edit.src"
          :src="renderIcon(edit.src)"
          alt="avatar"
          style="width: 100px; height: 100px"
      />
      <div
          v-if="edit.src"
          class="xt-bg-2 flex justify-center items-center xt-hover absolute"
          style="
          border-radius: 50%;
          padding: 5px;
          cursor: pointer;
          left: 90px;
          top: -10px;
        "
          @click.stop="clear()"
      >
        <Icon class="icon xt-text no-drag" icon="guanbi"></Icon>
      </div>
      <div v-else>
        <div class="ant-upload-text"></div>
      </div>
    </a-upload>
    <div
        class="absolute"
        style="top: 50%; transform: translateY(-50%); left: 120px"
    >
      <div class="xt-text-2" style="font-size: 16px">
        推荐图片尺寸：128*128，不能超过2MB
      </div>
      <XtButton class="btn no-drag xt-bg-2 mt-3" @click="imgUp()"
      >自定义上传
      </XtButton
      >
      <input
          ref="imgRef"
          accept="image/jpg,image/jpeg,image/png"
          style="display: none"
          type="file"
      />
    </div>
  </div>
</template>

<script>
import { fileUpload, validateFile, } from '../../../../card/hooks/imageProcessing'
import { getHostAddress } from '../hooks/getHostAddress'
import { message } from 'ant-design-vue'
import editMixins from '../hooks/mixins'
import { renderIcon } from '../../../../../js/common/common'

export default {
  mixins: [editMixins],
  data () {
    return {
      imgErrorCount: 0,
    }
  },
  computed: {
    radiusStyle () {
      if (this.isRadius) return { borderRadius: this.radius + 'px' }
      else return { borderRadius: '0px' }
    },
    backgroundState () {
      if (this.isBackground) {
        return { background: this.backgroundColor }
      } else return { background: 'none' }
    },
    imgStateStyle () {
      return {
        'object-fit': this.imgState,
      }
    },
  },
  methods: {
    renderIcon,
    imgUp () {
      let imgRef = this.$refs.imgRef
      imgRef.click()
      let that = this
      imgRef.onchange = function (event) {
        if (this.files.length === 0) return
        const file = this.files[0]
        that.beforeUpload(file)
      }
    },
    clear () {
      this.edit.src = ''
    },
    beforeUpload (file) {
      let validate = validateFile(file, 2)
      if (validate !== true) return message.error(validate)
      this.imgUpload(file)
    },
    async imgUpload (file) {
      let url = await fileUpload(file)
      if (url) this.edit.src = url
    },
    imgError () {
      if (this.edit.link === 'link') {
        this.imgErrorCount++
        const domain = getHostAddress(this.edit.open.value)
        switch (this.imgErrorCount) {
          case 1:
            this.edit.src = `https://www.svlik.com/t/favicon/ico.php?` + domain
            break
          default:
            this.edit.src = ''
            this.imgErrorCount = 0
            break
        }
      }
    },
  },
}
</script>

<style lang="scss" scoped></style>
