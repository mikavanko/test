import { watchEffect, ref } from 'vue'

export default {
  install: (app, options) => {
    const defaultOptions = {
      visible: true,
      useDocument: false,
      hideOnMenuClose: false,
    }

    const finalOptions = ref(defaultOptions)

    app.mixin({
      mounted() {
        if (this.$options.navbar) {
          const options = this.$options.navbar

          watchEffect(() => {
            finalOptions.value = Object.assign({}, defaultOptions, options)
          })
        }
      },
    });

    app.provide("options", finalOptions)
  },
};