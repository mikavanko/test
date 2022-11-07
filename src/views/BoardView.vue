<script>
import Board from "@/components/VBoard.vue"

export default {
  components: {
    Board,
  }
}
</script>

<template>
  <div class="board-page">
    <Board />
  </div>
</template>

<style lang="scss" scoped>
.board-page{
  padding: 36px 24px;
}
</style>
