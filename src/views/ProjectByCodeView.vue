<script setup>
import { onMounted, reactive } from "vue";
import { useRoute, useRouter } from "vue-router";
import { getProjectByCode } from "@/api/projects.js";
import ProjectAdapter from "@/adapters/Project.js";

const route = useRoute();
const router = useRouter();

const state = reactive({
  text: "Redirect ...",
});

onMounted(() => {
  const code = route.query.url_code || null;
  if (code) {
    getProjectByCode(code)
      .then((res) => {
        const project = ProjectAdapter(res.data.data);
        if (project.id) {
          router.push(`/projects/${project.id}`);
        }
      })
      .catch(() => {
        state.text = "Ошибка";
      });
  } else {
    state.text = "Код отсутствует";
  }
});
</script>

<template>
  <div class="home">
    {{ state.text }}
  </div>
</template>

<style lang="scss" scoped>
.home {
  width: 100%;
  height: 100%;
  position: relative;
}
</style>