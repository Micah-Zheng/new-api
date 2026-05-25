<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { useRoute } from 'vitepress'
import { withBase } from 'vitepress'

const videoRef = ref(null)
const videoSrc = withBase('/bg-video.mp4')
const route = useRoute()

onMounted(() => {
  if (videoRef.value) {
    videoRef.value.playbackRate = 0.8
  }
  document.documentElement.classList.add('has-video-bg')
})

onUnmounted(() => {
  document.documentElement.classList.remove('has-video-bg')
})
</script>

<template>
  <div class="home-video-bg">
    <video
      ref="videoRef"
      autoplay
      loop
      muted
      playsinline
      preload="auto"
    >
      <source :src="videoSrc" type="video/mp4" />
    </video>
    <div class="home-video-overlay" />
  </div>
</template>

<style scoped>
.home-video-bg {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  z-index: -1;
  overflow: hidden;
}

.home-video-bg video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.home-video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.35);
}
</style>
