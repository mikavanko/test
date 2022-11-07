<script>
import { nextTick, getCurrentInstance } from "vue";

export default {
  props: {
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
    customModalClass: {
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
    useScroll: {
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
    translateX: {
      type: String,
      default: "0%",
    },
    translateY: {
      type: String,
      default: "0%",
    },
    bgColor: {
      type: String,
      default: "",
    },
    captureClick: {
      type: Boolean,
      default: false,
    },
    padding: {
      type: String,
      default: "",
    },
    coords: {
      type: Object,
      default: () => null,
    },
    transitionMode: {
      type: String,
      default: "simple",
    },
    autoPositionMode: {
      type: Boolean,
      default: false,
    },
    zIndexModalWrapper: {
      type: String,
      default: "777",
    },
  },
  data() {
    return {
      show: this.modelValue,
      capturedCoords: null,
      autoPositionCoords: null,
      instance: null,
    };
  },
  watch: {
    modelValue: {
      handler(val) {
        this.show = val;

        // capture click coords to position modal
        if (val && this.captureClick) {
          document.addEventListener("click", this.captureClickHandler);
        }
      },
      // immediate: true,
    },
    isVisible: {
      handler(val) {
        if(val) {
          if(!window.modalsUid){
            window.modalsUid = [this.instance.uid]
          }else{
            window.modalsUid.push(this.instance.uid)
          }

          document.addEventListener("keydown", this.closeOnEsc)
        }else{
          document.removeEventListener("keydown", this.closeOnEsc)

          if(window.modalsUid){
            window.modalsUid.pop()
          }
        }
      }
    }
  },
  computed: {
    isVisible: {
      get() {
        return this.modelValue || this.show;
      },
      set(val) {
        this.show = val;
        this.$emit("update:modelValue", val);
      },
    },
    coordsComp: function () {
      const coords = {
        ...(this.autoPositionCoords ||
          this.capturedCoords ||
          this.coords ||
          null),
      };
      return coords;
    },
  },
  methods: {
    closeOnEsc(e){
      if(e.key === "Escape"){
        if(this.instance.uid === window.modalsUid[window.modalsUid.length - 1]){
          this.isVisible = false
        }
      }
    },
    toggleVisibility() {
      this.isVisible = !this.isVisible;
    },
    closeModal() {
      this.isVisible = false;
      this.$emit("modal-close");
    },
    openModal() {
      this.isVisible = true;
      this.$emit("modal-open");
    },
    captureClickHandler(e) {
      this.capturedCoords = {
        x: e.clientX,
        y: e.clientY,
      };
      document.removeEventListener("click", this.captureClickHandler);
    },
    onBeforeEnter() {
      console.log("onBeforeEnter");
    },
    onEnter() {
      console.log("onEnter");
    },
    onLeave() {
      console.log("onLeave");
    },
    watchAutoPositionMode() {
      if (this.autoPositionMode) {
        this.$watch(
          "modelValue",
          (val) => {
            if (val) {
              nextTick(() => {
                this.setAutoPosition();
              });
            } else {
              this.autoPositionCoords = null;
            }
          },
          { immediate: true }
        );
      }
    },
    getAutoPosition() {
      const el = this.$refs.modalRef;
      if (el) {
        const rect = el.getBoundingClientRect();
        const w = window.innerWidth;
        const h = window.innerHeight;
        const padding = 20;

        const newPos = {
          x: rect.x,
          y: rect.y,
        };

        if (rect.top < 0 + padding) {
          newPos.y = padding;
        }
        if (rect.bottom > h - padding) {
          newPos.y = h - rect.height - padding;
        }
        if (rect.left < 0 + padding) {
          newPos.x = padding;
        }
        if (rect.right > w - padding) {
          newPos.x = w - rect.width - padding;
        }

        return newPos;
      } else {
        return null;
      }
    },
    setAutoPosition() {
      this.autoPositionCoords = this.getAutoPosition();
    },
  },
  mounted() {
    if (this.id) {
      this.$bus.$on(`modal-open:${this.id}`, () => {
        this.isVisible = true;
        this.$emit("modal-open");
      });
      this.$bus.$on(`modal-close:${this.id}`, () => {
        this.isVisible = false;
        this.$emit("modal-close");
      });
    }

    this.watchAutoPositionMode();

    this.instance = getCurrentInstance();
  },
};
</script>

<template>
  <Transition :name="`modal-transition-${$props.transitionMode}`">
    <div
      :class="['modal-wrapper', customWrapperClass]"
      v-if="isVisible"
      :style="{
        '--width': width,
        '--height': height,
        '--overflow-y': $props.useScroll ? 'auto' : 'visible',
        '--translateX': autoPositionCoords ? '0' : $props.translateX,
        '--translateY': autoPositionCoords ? '0' : $props.translateY,
        '--left': coordsComp?.x + 'px',
        '--top': coordsComp?.y + 'px',
        '--customPadding': $props.padding,
        '--zIndexModalWrapper': $props.zIndexModalWrapper,
      }"
    >
      <div
        class="modal-bg"
        :style="{ 'background-color': $props.bgColor }"
        @click.stop="closeModal"
      />
      <div
        ref="modalRef"
        :class="[
          'modal',
          customModalClass,
          { 'use-coords': $props.captureClick || $props.coords },
          { customPadding: $props.padding },
        ]"
      >
        <div class="modal-top" v-if="showModalTop">
          <div class="modal-top__left">
            <slot name="top-left-content">
              <span class="modal-close" @click="closeModal" v-if="useCloseBtn"
                >Закрыть</span
              >
            </slot>
          </div>
          <h3 class="modal-h2">{{ title }}</h3>
          <div class="modal-top__right">
            <slot name="top-right-content" />
          </div>
        </div>
        <div
          :class="['modal-body', customBodyClass, { 'no-top': !showModalTop }]"
        >
          <slot name="body" v-bind="$props" />
          <slot />
        </div>
      </div>
    </div>
  </Transition>
</template>

<style lang="scss" scoped>
//  Transition modes:
// === simple
.modal-transition-simple-enter-active {
  transition: all 0.3s ease-out;
}

.modal-transition-simple-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.modal-transition-simple-enter-from,
.modal-transition-simple-leave-to {
  opacity: 0;
}
</style>

<style lang="scss" scoped>
.modal-h2 {
  font-weight: 400;
  font-size: 18px;
  line-height: 24px;
}
.modal {
  $p: &;

  overflow-y: var(--overflow-y);
  width: var(--width);
  height: var(--height);
  background-color: $color-light;
  position: absolute;
  display: flex;
  flex-direction: column;
  z-index: 777;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);

  &.use-coords {
    top: var(--top);
    left: var(--left);
    transform: translateX(var(--translateX)) translateY(var(--translateY));
  }

  @media all and (min-width: $xl) {
    box-shadow: 0px 0px 20px rgba(3, 2, 41, 0.15);
    border-radius: 8px;
  }

  &-bg {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(3, 2, 41, 0.6);
    cursor: auto;
    z-index: 777;
  }

  &-body {
    padding: 24px;
    flex-grow: 1;

    @media all and (min-width: $xl) {
      padding: 30px 20px;
    }

    &.no-top {
      height: 100%;
    }
  }

  &.customPadding {
    #{$p}-body {
      padding: var(--customPadding) !important;
    }
  }

  &-wrapper {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: $bottomNavbarHeight;
    z-index: var(--zIndexModalWrapper);

    @media all and (min-width: $xl) {
      bottom: 0;
    }
  }

  &-top {
    padding: 16px 0;
    text-align: center;
    border-bottom: 1px solid $color-dark-10;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 57px;
    min-height: 57px;

    &__left,
    &__right {
      position: absolute;
      top: 18px;
    }
    &__left {
      left: 24px;
    }
    &__right {
      right: 24px;
    }
  }

  &-close {
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    color: $color-primary;
    cursor: pointer;
  }
}
</style>