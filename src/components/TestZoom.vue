//TestZoom.vue
<template>
  <div class="zoom-container">
    <div
      class="zoomable-area"
      @wheel.prevent="handleWheel"
      @mousedown="startPan"
      @mousemove="pan"
      @mouseup="endPan"
      @mouseleave="endPan"
      @touchstart="handleTouchStart"
      @touchmove.prevent="handleTouchMove"
      @touchend="handleTouchEnd"
      :class="currentTool.toLowerCase()"
    >
      <slot :zoomLevel="zoomLevel" :panX="panX" :panY="panY" :cursor="getCursor" />
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const props = defineProps({
  containerWidth: {
    type: Number,
    default: 0,
  },
  containerHeight: {
    type: Number,
    default: 0,
  },
  contentWidth: {
    type: Number,
    default: 0,
  },
  contentHeight: {
    type: Number,
    default: 0,
  },
});

const zoomLevel = ref(1);
const zoomStep = 0.1;
const minZoom = 0.5;
const maxZoom = 3;
const panX = ref(0);
const panY = ref(0);
const isPanning = ref(false);
const lastX = ref(0);
const lastY = ref(0);
const touches = ref([]);
const currentTool = ref('HAND');

const getCursor = computed(() => {
  if (isPanning.value) return 'grabbing';
  if (currentTool.value === 'HAND') return 'grab';
  return 'zoom-in';
});

const maxPanX = computed(() => {
  if (zoomLevel.value <= 1) return 0;
  return Math.max(0, (props.contentWidth * zoomLevel.value - props.containerWidth) / (2 * zoomLevel.value));
});

const maxPanY = computed(() => {
  if (zoomLevel.value <= 1) return 0;
  return Math.max(0, (props.contentHeight * zoomLevel.value - props.containerHeight) / (2 * zoomLevel.value));
});

const formatZoomLevel = computed(() => {
  return Math.round(zoomLevel.value * 100);
});

const constrainPan = () => {
  if (zoomLevel.value <= 1) {
    panX.value = 0;
    panY.value = 0;
    return;
  }
  panX.value = Math.min(Math.max(panX.value, -maxPanX.value), maxPanX.value);
  panY.value = Math.min(Math.max(panY.value, -maxPanY.value), maxPanY.value);
};

const setZoom = (newZoom) => {
  zoomLevel.value = Math.min(Math.max(newZoom, minZoom), maxZoom);
  constrainPan();
};

const zoomIn = () => setZoom(zoomLevel.value + zoomStep);
const zoomOut = () => setZoom(zoomLevel.value - zoomStep);

const resetZoom = () => {
  zoomLevel.value = 1;
  panX.value = 0;
  panY.value = 0;
  constrainPan();
};

const handleWheel = (e) => {
  if (currentTool.value === 'HAND') {
    panX.value += e.deltaX / zoomLevel.value;
    panY.value += e.deltaY / zoomLevel.value;
    constrainPan();
  }
};

const startPan = (e) => {
  if (currentTool.value !== 'HAND') return;
  isPanning.value = true;
  lastX.value = e.clientX;
  lastY.value = e.clientY;
};

const pan = (e) => {
  if (!isPanning.value) return;
  const deltaX = (e.clientX - lastX.value) / zoomLevel.value;
  const deltaY = (e.clientY - lastY.value) / zoomLevel.value;
  panX.value += deltaX;
  panY.value += deltaY;
  lastX.value = e.clientX;
  lastY.value = e.clientY;
  constrainPan();
};

const endPan = () => {
  isPanning.value = false;
};

const handleTouchStart = (e) => {
  touches.value = [...e.touches];
  if (e.touches.length === 2) {
    e.preventDefault();
  }
};

const handleTouchMove = (e) => {
  if (e.touches.length === 2) {
    const currentTouches = [...e.touches];
    const currentDistance = Math.hypot(
      currentTouches[0].clientX - currentTouches[1].clientX,
      currentTouches[0].clientY - currentTouches[1].clientY
    );
    const previousDistance = Math.hypot(
      touches.value[0].clientX - touches.value[1].clientX,
      touches.value[0].clientY - touches.value[1].clientY
    );
    const delta = (currentDistance - previousDistance) * 0.01;
    setZoom(zoomLevel.value + delta);
    touches.value = currentTouches;
    constrainPan();
  }
};

const handleTouchEnd = () => {
  touches.value = [];
};

const setTool = (tool) => {
  currentTool.value = tool;
};

defineExpose({
  zoomIn,
  zoomOut,
  resetZoom,
  setTool,
  formatZoomLevel,
});
</script>

<style scoped>
.zoom-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
}

.zoom-controls {
  margin-bottom: 10px;
  z-index: 10;
  display: flex;
  align-items: center;
  gap: 10px;
}

.zoom-controls button {
  padding: 5px 10px;
  cursor: pointer;
}

.zoom-level {
  min-width: 60px;
  text-align: center;
}

.zoomable-area {
  position: relative;
  overflow: hidden;
  flex: 1;
  border: 1px solid #ccc;
}


.tool-controls {
  display: flex;
  gap: 5px;
  margin-left: 10px;
}

.tool-controls button {
  padding: 5px 10px;
  cursor: pointer;
  border: 1px solid #ccc;
  background: white;
}

.tool-controls button.active {
  background: #e0e0e0;
  border-color: #999;
}

.zoomable-area.hand {
  cursor: grab;
}

.zoomable-area.zoom {
  cursor: zoom-in;
}
</style>