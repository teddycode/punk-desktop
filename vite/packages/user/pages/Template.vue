<template>
  <div style="padding: 40px;padding-top: 20px">
    <h2>欢迎使用空间模板功能</h2>
    <a-row class="type" type="flex">
      <a-col flex="60px">
        <img src="../assets/icon/right.svg" style="width: 40px">
      </a-col>
      <a-col>
        <div class="title">个人空间模板</div>
        <div class="summary">自己使用的空间模板。<br>主要用于与将自己认为比较好的标签组搭配保存成模板，以便下次取用。</div>
      </a-col>
    </a-row>
    <a-row class="type" type="flex">
      <a-col flex="60px">
        <img src="../assets/icon/group.svg" style="width: 40px">
      </a-col>

      <a-col>
        <div class="title">团队空间模板</div>
        <div class="summary">共享空间模板给团队成员使用，团队下的所有成员均可使用这些空间模板。<br>主要用于共享空间模板给新入职的同事。
        </div>
      </a-col>
    </a-row>
    <a-row class="type" type="flex">
      <a-col flex="60px">
        <img src="../assets/icon/share.svg" style="width: 40px">
      </a-col>
      <a-col>
        <div class="title">公共空间模板</div>
        <div class="summary">其他用户全网共享的标签组、空间。<br>主要用于与网友共享资源、共享职业常用网站等。</div>
      </a-col>
    </a-row>

    <div style="text-align: center;margin-top: 20px">
      <p>
        <a-button disabled type="primary">开始使用</a-button>
      </p>
      <p class="summary">空间模板功能即将上线，敬请期待</p>
    </div>
  </div>


</template>

<script>
export default {
  name: 'Template'
}
</script>

<style lang="scss" scoped>
.title {
  font-size: 16px;
  font-weight: bold;
}

.type {
  padding: 20px;
  margin-bottom: 10px;
  border-radius: 8px;
  background: #efefef;
}

.summary {
  color: #999;
}
</style>
