<template>
  <div class="hero-video">
    <video
      ref="videoEl"
      class="hero-video__video"
      src="src/assets/video/indexPage/Video.mp4"
      autoplay
      muted
      loop
      playsinline
    ></video>

    <div class="hero-video__overlay"></div>

    <div class="hero-video__content">
      <h1>Welcome to Jotter-Finance</h1>
      <p>Your strategic decision support starts here.</p>
      <q-btn label="Get Started" color="primary" class="q-mt-md" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";

const videoEl = ref(null);

onMounted(() => {
  if (videoEl.value) {
    videoEl.value.play().catch((err) => console.warn("Autoplay blocked:", err));
  }
});
</script>

<style scoped>
.hero-video {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.hero-video__video {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: translate(-50%, -50%);
  z-index: 1;
}

.hero-video__overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2;
}

.hero-video__content {
  position: relative;
  z-index: 3;
  text-align: center;
  color: white;
  top: 50%;
  transform: translateY(-50%);
  padding: 0 20px;
}

.hero-video__content h1 {
  font-size: 3rem;
  font-weight: bold;
}

.hero-video__content p {
  font-size: 1.5rem;
  margin-top: 1rem;
}
</style>
