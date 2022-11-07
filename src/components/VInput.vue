<script>
import { isMobile } from "@/assets/js/utils";
import {
  reactive,
  computed,
  inject,
  onMounted,
  getCurrentInstance,
  onBeforeUnmount,
  watch,
  useSlots,
  defineExpose,
  ref,
} from "vue";

import InfoIcon from "@/assets/icons/svg/info.svg";
import EyeIcon from "@/assets/icons/svg/eye.svg";
import EyeSlashIcon from "@/assets/icons/svg/eye-slash.svg";

import { mask as maskDirective } from "vue-the-mask";

export default {
  emits: ["update:value", "update:has-error", "focus", "blur"],
  directives: {
    mask: maskDirective,
  },
  props: {
    required: {
      type: Boolean,
      default: true,
    },
    value: {
      type: String,
      default: null,
    },
    name: {
      type: String,
    },
    type: {
      type: String,
      default: "text",
    },
    placeholder: {
      type: String,
      default: "",
    },
    label: {
      type: String,
    },
    info: {
      type: String,
    },
    infoFontSize: {
      type: String,
      default: "12px",
    },
    errorText: {
      type: String,
    },
    hintErrorText: {
      type: String,
    },
    hintErrorTextWidth: {
      type: String,
      default: "200px",
    },
    rules: {
      type: Array,
      default: null,
    },
    hasError: {
      type: Boolean,
      default: false,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
    readonly: {
      type: Boolean,
      default: false,
    },
    useErrorIcon: {
      type: Boolean,
      default: false,
    },
    mask: {
      type: String,
      default: null,
    },
    width: {
      type: String,
      default: "auto",
    },
    height: {
      type: String,
      default: "52px",
    },
    customInputWrapperClass: {
      type: String,
      default: "",
    },
    notUse: {
      type: Boolean,
      default: false,
    }
  },
  setup(props, { emit }){
    const slots = useSlots()

    const state = reactive({
      hasError: props.hasError,
      isPasswordVisible: false,
      isHintVisible: false,
      hintTimerId: null,
      // prefixSlotWidth: null,
      // suffixSlotWidth: null,
    });

    const form = inject("form");
    const curInst = getCurrentInstance();
    const uid = curInst.uid;

    const prefixIcon = ref()
    const suffixIcon = ref()

    onMounted(() => {
      form &&
        form.bind({
          required: props.required,
          validate,
          getValue,
          uid,
          name: props.name,
          errorText: props.errorText,
          notUse: props.notUse,
        });
    });

    onBeforeUnmount(() => {
      form && form.unbind(uid);
    });

    function onChange(e) {
      // TODO почему то вызывается 2 раза ???
      state.hasError && (state.hasError = false);
      emit("update:has-error", false);
      emit("update:value", e.target.value);
    }

    function onFocus(e) {
      emit("focus", e);
    }
    function onBlur(e) {
      emit("blur", e);
    }

    function validate() {
      let hasError = false;

      if (props.rules && props.rules.length) {
        for (const rule of props.rules) {
          hasError = rule.validator(props.value);

          if (hasError) {
            console.log('hasError')
            // toggleHintByTimer();
            break;
          }
        }
      }

      state.hasError = hasError;

      return {
        name: props.name,
        errorText: props.errorText,
        hasError,
        hasNotRuleError: props.hasError,
      };
    }

    function getValue() {
      return { name: props.name, value: props.value };
    }

    const hasErr = computed(() => state.hasError || props.hasError);

    const inputProps = computed(() => ({
      type: state.isPasswordVisible ? "text" : props.type,
      placeholder: props.placeholder,
      class: "input",
      disabled: props.disabled,
      readonly: props.readonly,
      value: props.value,
      onInput: onChange,
      onFocus,
      onBlur,
    }));

    const showHint = () => {
      state.isHintVisible = true;
    };
    const hideHint = () => {
      if(!state.hintTimerId){
        state.isHintVisible = false;
      }
    };

    const toggleHintByTimer = () => {
      if(props.hintErrorText){
        state.hintTimerId && clearInterval(state.hintTimerId)
        showHint()
        state.hintTimerId = setTimeout(() => {
          hideHint();
          state.hintTimerId = null
        }, 3000);
      }
    };

    defineExpose({
      validate,
      getValue,
    });
    
    return{
      isMobile,
      state,
      onChange,
      validate,
      getValue,
      hasErr,
      inputProps,
      showHint,
      hideHint,
      toggleHintByTimer,
      prefixIcon,
      suffixIcon,
    }
  },
  components: {
    InfoIcon,
    EyeIcon,
    EyeSlashIcon,
  }
}
</script>

<template>
  <div
    :class="[
      'input-row',
      customInputWrapperClass,
      { 'has-error': hasErr, disabled: disabled },
    ]"
    :style="{
      '--width': width,
      '--height': height,
      '--paddingLeft': (prefixIcon?.clientWidth || 16) + 'px',
      '--paddingRight': (suffixIcon?.clientWidth || 16) + 'px',
      '--infoFontSize': infoFontSize,
      
    }"
  >
    <label class="label" v-if="label">{{ label }}</label>
    <div class="input-wrapper">
      <input v-if="mask" v-bind="inputProps" v-mask="mask" />
      <input v-else v-bind="inputProps" />

      <div class="input__prefixIcon" v-if="$slots.prefixIcon" ref="prefixIcon">
        <slot name="prefixIcon" />
      </div>
      <div
        class="input__suffixIcon"
        v-if="$slots.suffixIcon || hasErr || type === 'password'"
        ref="suffixIcon"
      >
        <slot name="suffixIcon" />
        <div
          v-if="type === 'password'"
          class="password-icon"
          @click="state.isPasswordVisible = !state.isPasswordVisible"
        >
          <EyeIcon v-if="state.isPasswordVisible" />
          <EyeSlashIcon v-else />
        </div>
        <!--  Error icon for Mobile START -->
        <div
          v-if="isMobile() && hasErr"
          class="input-error-icon"
          @mouseover="showHint"
          @mouseleave="hideHint"
        >
          <slot name="errorIcon">
            <InfoIcon />
          </slot>
        </div>
        <!--  Error icon for Mobile END -->
      </div>
      <!-- Hint for Mobile START -->
      <div
        v-if="isMobile() && hintErrorText && state.isHintVisible"
        class="hint"
        :style="{
          '--hintErrorTextWidth': hintErrorTextWidth,
        }"
        v-html="hintErrorText"
      />
        
      <!-- Hint for Mobile END -->
      <div class="input__outside-content-left" v-if="$slots.outsideContentLeft">
        <slot name="outsideContentLeft" />
      </div>
      <div
        class="input__outside-content-right"
        v-if="$slots.outsideContentRight || hasErr"
      >
        <!-- Hint and error icon for Desktop START -->
        <div
          v-if="!isMobile() && hasErr"
          class="input-error-icon"
          @mouseover="showHint"
          @mouseleave="hideHint"
        >
          <slot name="errorIcon">
            <InfoIcon />
          </slot>
          <div
            v-if="hintErrorText && state.isHintVisible"
            class="hint"
            :style="{
              '--hintErrorTextWidth': hintErrorTextWidth,
            }"
            v-html="hintErrorText"
          />
        </div>
        <!-- Hint and error icon for Desktop END -->
        <slot name="outsideContentRight" />
      </div>
    </div>
    <div class="input-info" v-if="info">{{ info }}</div>
  </div>
</template>

<style lang="scss" scoped>
.label {
  display: block;
  font-weight: 400;
  font-size: 14px;
  line-height: 21px;
  margin-bottom: 2px;
}

.input {
  height: 100%;
  line-height: 1;
  border: 1px solid $color-dark-20;
  border-radius: 8px;
  width: 100%;
  padding: 0 16px;
  padding-left: var(--paddingLeft);
  padding-right: var(--paddingRight);
  color: $color-dark-70;
  letter-spacing: 0.1em;
  font-weight: 400;
  font-size: 14px;
  outline: none;
  font-family: $Lato;

  &-row {
    width: var(--width);
  }

  &__prefixIcon {
    position: absolute;
    top: 1px;
    left: 1px;
    bottom: 1px;
    background: transparent;
    padding: 0 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
  }
  &__suffixIcon {
    position: absolute;
    top: 1px;
    right: 1px;
    bottom: 1px;
    background: transparent;
    padding: 0 16px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    font-size: 19px;

    @media all and (min-width: $xl) {
      font-size: 14px;
    }
  }

  &-error-icon {
    font-size: 19px;
    color: $color-error;
    margin-left: 8px;
    display: flex;
    position: relative;

    @media all and (min-width: $xl) {
      font-size: 14px;
      margin-left: 10px;
      margin-right: 5px;

      & .hint {
        position: absolute;
        top: 50%;
        left: calc(100% + 10px);
        transform: translateY(-50%);
        width: var(--hintErrorTextWidth);
        background-color: $color-dark-40;
        color: $color-light;
        padding: 8px;
        box-shadow: 0px 0px 20px rgba(3, 2, 41, 0.15);
        border-radius: 6px;
        font-weight: 400;
        font-size: 12px;
        line-height: 14px;
        z-index: 1;
        white-space: pre-line;
      }
    }
  }

  &:focus {
    border-color: $color-primary;
  }

  &:disabled {
    background-color: $color-light-f;
  }

  &-wrapper {
    position: relative;
    height: var(--height);
    width: 100%;
    user-select: none;

    @media all and (max-width: $xl - 1px) {
      .hint {
        position: absolute;
        top: 100%;
        right: 0;
        width: var(--hintErrorTextWidth);
        background-color: $color-dark-40;
        color: $color-light;
        padding: 8px;
        box-shadow: 0px 0px 20px rgba(3, 2, 41, 0.15);
        border-radius: 6px;
        font-weight: 400;
        font-size: 12px;
        line-height: 14px;
        z-index: 1;
        white-space: pre-line;
      }
    }
  }

  &-info {
    font-weight: 400;
    font-size: var(--infoFontSize);
    line-height: 1.5;
    color: $color-dark-40;
    margin-top: 4px;
  }

  &::placeholder {
    color: $color-dark-20;
  }

  &[type="number"] {
    -moz-appearance: textfield;

    &::-webkit-outer-spin-button,
    &::-webkit-inner-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }
  }

  &__outside-content-left {
    position: absolute;
    right: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
  &__outside-content-right {
    position: absolute;
    left: 100%;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    justify-content: center;
    align-items: center;
  }
}

.has-error {
  .input {
    border-color: $color-error;
  }
}

.password-icon {
  font-size: 19px;
  line-height: 19px;
  display: flex;
  color: $color-dark-40;
  cursor: pointer;
}
</style>
