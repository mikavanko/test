<script setup>
import {
  watch,
  onMounted,
  onUnmounted,
  computed,
  getCurrentInstance,
  ref,
  reactive,
} from "vue";
import renderComponent from "@/assets/js/renderComponent";
import Modal from "@/components/VModal.vue";

const emit = defineEmits(["update:isVisible"]);

const props = defineProps({
  isVisible: {
    type: Boolean,
    default: false,
  },
  modelValue: {
    type: Boolean,
    default: false,
  },
  useCloseBtn: {
    type: Boolean,
    default: true,
  },
  customBodyClass: {
    type: String,
    default: "",
  },
  customWrapperClass: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    default: "",
  },
  showModalTop: {
    type: Boolean,
    default: true,
  },
  width: {
    type: String,
    default: "100%",
  },
  height: {
    type: String,
    default: "100%",
  },
  renderTo: {
    type: String,
    default: null,
  },
});

watch(props.isVisible, (val) => {
  state.show = val
});

const state = reactive({
  show: props.isVisible,
});

const isModalVisible = computed({
  get() {
    return props.isVisible || state.show;
  },
  set(val) {
    state.show = val
    emit("update:isVisible", val);
  },
});

const { appContext } = getCurrentInstance();
const container = ref();
let counter = 1;
let destroyComp = null;

onUnmounted(() => destroyComp?.());

watch(isModalVisible, (val) => {
  if(val){
    insert()
  }
});

const insert = async () => {
  if (props.renderTo) {
    const modal = (await import('@/components/VModal.vue')).default
    destroyComp?.();
    destroyComp = renderComponent({
      el: document.querySelector(props.renderTo),
      component: (await import('@/components/VModal.vue')).default,
      props: props,
      appContext,
    });
  }
};
</script>

<template>
<div></div>
  <!-- <Modal v-bind="props" v-model="isModalVisible" /> -->
</template>

<style lang="scss" scoped>
</style>