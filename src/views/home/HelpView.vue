<script>
import Plug from "@/components/VPlug.vue";

export default {
  components: {
    Plug,
  },
  navbar: {
    useDocument: false,
    hideOnMenuClose: true,
  },
}
</script>

<template>
  <div class="home">
    <Plug />
  </div>
</template>

<style lang="scss" scoped>
.home{
  width: 100%;
  height: 100vh;
  position: relative;
}
</style>