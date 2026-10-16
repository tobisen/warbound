<script lang="ts">
import { defineComponent, type PropType } from 'vue'
import SlideFrame from '../deck/SlideFrame.vue'

interface ColumnItem {
  label?: string
  title: string
  text: string
}

export default defineComponent({
  name: 'ThreeColumnSlide',
  components: { SlideFrame },
  props: {
    kicker: { type: String, default: '' },
    title: { type: String, required: true },
    columns: { type: Array as PropType<ColumnItem[]>, default: () => [] },
  },
})
</script>

<template>
  <SlideFrame :kicker="kicker" variant="three-column">
    <div class="three-column-slide">
      <h2 class="slide-title slide-title--medium">{{ title }}</h2>
      <div class="three-column-slide__grid">
        <article v-for="(column, index) in columns" :key="`${column.title}-${index}`">
          <span>{{ column.label || String(index + 1).padStart(2, '0') }}</span>
          <h3>{{ column.title }}</h3>
          <p>{{ column.text }}</p>
        </article>
      </div>
    </div>
  </SlideFrame>
</template>
