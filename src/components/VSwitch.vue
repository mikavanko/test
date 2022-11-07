<script setup>
import {reactive} from 'vue'

defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  }
})
</script>

<template>
  <div :class="['switch', {'on': modelValue}]"
       @click="$emit('update:modelValue', !modelValue)"
  />
</template>

<style lang="scss" scoped>
.switch{
  width: 38px;
  height: 20px;
  background-color: $color-dark-20;
  border-radius: 40px;
  cursor: pointer;
  position: relative;
  transition: background-color 0.3s ease;

  &::before{
    content: "";
    display: block;
    width: 16px;
    height: 16px;
    border-radius: 100%;
    background-color: $color-light;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform 0.3s ease;
  }

  &.on{
    background-color: $color-primary;

    &::before{
      transform: translateX(18px);
    }
  }
}
</style>