<script>
import { computed, onMounted, reactive, watch, watchEffect } from "vue";
import { useStore } from "vuex";
import { useRouter } from 'vue-router';

export default{
  components: {
  },
  setup(){
    const router = useRouter()
    const store = useStore()

    const currentProject = computed(
      () => store.getters["projects/getCurrentProject"]
    );

    return {
    }
  }
}
</script>

<template>
  <div class="home">
  </div>
</template>