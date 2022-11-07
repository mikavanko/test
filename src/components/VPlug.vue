<script setup>
import PlugIcon from "@/static/img/plug.svg"
</script>

<template>
  <div class="plug-wrapper">
    <div class="plug">
      <h2 class="plug-title">Мы работаем над данным разделом</h2>
      <PlugIcon class="plug-icon" />
    </div>  
  </div>
</template>

<style lang="scss">
.plug{
  width: 302px;
  box-shadow: 0px 0px 20px rgba(3, 2, 41, 0.15);
  backdrop-filter: blur(5px);
  border-radius: 8px;
  padding: 35px 15px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: $color-light;

  &-wrapper{
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(79, 78, 106, 0.1);
    backdrop-filter: blur(4px);
  }

  &-title{
    font-weight: 400;
    font-size: 16px;
    line-height: 24px;
    margin-bottom: 10px;
  }

  &-icon{
    font-size: 178px;
    width: auto;
  }
}
</style>
