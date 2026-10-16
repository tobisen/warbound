<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'SlideFrame',
  props: {
    kicker: {
      type: String,
      default: '',
    },
    meta: {
      type: String,
      default: 'Vue Presentation Template',
    },
    variant: {
      type: String,
      default: 'default',
    },
    templateId: {
      type: String,
      default: '',
    },
  },
})
</script>

<template>
  <section class="slide" :class="`slide--${variant}`">
    <div class="slide__accent" aria-hidden="true" />
    <div v-if="templateId" class="slide-template-id">{{ templateId }}</div>
    <div v-if="kicker" class="slide-kicker">{{ kicker }}</div>
    <div class="slide__content">
      <slot />
    </div>
    <footer class="slide-footer">
      <span>{{ meta }}</span>
      <span>16:9</span>
    </footer>
  </section>
</template>
