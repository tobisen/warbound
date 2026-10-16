<script lang="ts">
import { defineComponent } from 'vue'
import SlideFrame from '../deck/SlideFrame.vue'

export default defineComponent({
  name: 'TitleSlide',
  components: { SlideFrame },
  props: {
    kicker: { type: String, default: '' },
    title: { type: String, required: true },
    subtitle: { type: String, default: '' },
    presenter: { type: String, default: '' },
    meta: { type: String, default: '' },
  },
})
</script>

<template>
  <SlideFrame :kicker="kicker" :meta="meta || presenter" variant="title">
    <div class="title-slide">
      <h1 class="slide-title">{{ title }}</h1>
      <p v-if="subtitle" class="slide-body">{{ subtitle }}</p>
      <div v-if="presenter || meta" class="title-slide__meta">
        <span v-if="presenter">{{ presenter }}</span>
        <span v-if="meta">{{ meta }}</span>
      </div>
    </div>
  </SlideFrame>
</template>
