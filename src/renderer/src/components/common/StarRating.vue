<script setup lang="ts">
const props = defineProps<{
  rating: number
}>()

const emit = defineEmits<{
  (e: 'update', rating: number): void
}>()

function handleClick(star: number): void {
  // 再次点击同一星级则清零
  emit('update', star === props.rating ? 0 : star)
}
</script>

<template>
  <div class="star-rating">
    <button
      v-for="i in 5"
      :key="i"
      class="star-btn"
      :class="{ active: i <= rating }"
      @click="handleClick(i)"
      :title="`${i} 星`"
    >
      ★
    </button>
  </div>
</template>

<style scoped>
.star-rating {
  display: flex;
  gap: 2px;
}

.star-btn {
  font-size: 20px;
  color: var(--star-inactive);
  transition: all var(--transition-fast);
  padding: 2px;
}

.star-btn:hover {
  color: var(--star-active);
  transform: scale(1.2);
}

.star-btn.active {
  color: var(--star-active);
}
</style>
