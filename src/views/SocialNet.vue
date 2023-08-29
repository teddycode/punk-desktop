<template>
    <dv-border-box10>
      <div class="social-net">
          <div class="title">Social Net</div>
      </div>
    </dv-border-box10>
</template>

<script>
export default {
    name: "SocialNet"
}
</script>

<style scoped>
.social-net{
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 100%;
}
.title {
    padding-top: 10px;
    font-size: 1.5rem;
    color: #5ab1ef;
}
</style>