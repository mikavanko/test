<script>
import { defineAsyncComponent } from "vue";

export default {
  props: {
    name: {
      type: String,
      required: true,
    },
  },
  computed: {
    dynamicComponent() {
      const name = this.name;

      return defineAsyncComponent(() => import(`../../assets/icons/svg/${name}.svg`));
    }
  }
};
</script>

<template>
  <component :is="name" />
</template>