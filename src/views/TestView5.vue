<template>
  <div class="zoom-container">
    <div class="zoom-controls">
      <button @click="zoomIn">+</button>
      <span class="zoom-level">{{ Math.round(zoomLevel * 100) }}%</span>
      <button @click="zoomOut">-</button>
      <button @click="resetZoom">Reset</button>
      <div class="tool-controls">
        <button 
          :class="{ active: currentTool === 'HAND' }"
          @click="setTool('HAND')"
        >
          ✋
        </button>
        <button 
          :class="{ active: currentTool === 'ZOOM' }"
          @click="setTool('ZOOM')"
        >
          🔍
        </button>
      </div>
    </div>
    <div 
      class="zoomable-wrapper"
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
      <div
        class="zoomable-content"
        :style="{
          transform: `scale(${zoomLevel}) translate(${panX}px, ${panY}px)`,
          cursor: getCursor
        }"
      >
        <div class="inner">

freestar 

 

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Quisque ut ultricies lacus. Pellentesque euismod risus nec nisl faucibus, vel commodo turpis varius. Sed viverra eu sem placerat imperdiet. Nunc in mi ut neque sagittis mollis vel sed odio. Pellentesque sit amet congue urna. Donec sed hendrerit elit. Cras semper in lorem ut tincidunt. Phasellus ullamcorper, tellus eu laoreet porttitor, lacus est euismod enim, a porta purus turpis vel odio.

Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Nunc tempus purus non ligula dignissim sodales. Praesent volutpat faucibus augue. Proin elit mauris, tempor a placerat non, malesuada id urna. Fusce et ante sit amet felis mattis mattis ut et tellus. Nullam elementum tellus nec diam dapibus, ac tincidunt ante rutrum. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas accumsan luctus lacus a accumsan. Aliquam non elit tincidunt, aliquam tortor vel, auctor ante.

Aenean aliquam velit velit, vel molestie justo facilisis sed. Donec ac turpis dui. Donec venenatis metus elit, vel fringilla dolor fringilla ac. Integer malesuada quis nulla vel porta. Duis faucibus velit id lorem tempus efficitur. Interdum et malesuada fames ac ante ipsum primis in faucibus. Sed in mattis dolor. Vivamus ac eros id magna finibus volutpat ut eget nunc. Integer et varius purus. Fusce at gravida dui. Nunc molestie laoreet mi, non placerat eros. Fusce tincidunt et sapien sit amet placerat. Nunc quis neque at velit vestibulum lobortis. Suspendisse potenti. Vestibulum nisl nisi, lobortis ut viverra vitae, ullamcorper ultrices nunc.

Fusce tempor arcu ut neque sagittis efficitur. Aliquam bibendum neque elit, et efficitur ex placerat et. Vivamus id pulvinar erat. Ut porta eros a urna viverra, eget ultrices urna maximus. Praesent suscipit purus a quam pharetra pharetra. Fusce pretium dignissim purus. Integer id lacus vitae risus malesuada aliquet quis non tortor. Vivamus et ullamcorper nibh. Vivamus feugiat risus lorem, ut aliquet ex pulvinar in. Etiam maximus varius ipsum, eu semper magna porttitor a.

Suspendisse vestibulum purus quis elit mollis, id varius diam gravida. Aliquam hendrerit dui ultrices, pretium ex vel, vestibulum nisi. Duis elementum feugiat mauris, eget mollis felis sagittis a. Phasellus arcu sapien, auctor at iaculis et, ornare id ipsum. Curabitur et imperdiet massa. Praesent ut justo enim. Fusce eros leo, varius eu turpis pharetra, rhoncus bibendum ex. Phasellus in leo sit amet nisi auctor placerat. Morbi vulputate, turpis at rutrum feugiat, erat enim scelerisque lectus, sit amet dapibus sapien lorem quis velit. Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. In eros sem, varius a consequat dictum, luctus at nisl. Praesent et pellentesque tortor. Donec elementum vel ex ut fermentum. Donec commodo interdum euismod. Proin vel dignissim diam, in tempus quam. Aenean condimentum, augue quis pretium tincidunt, ligula libero pretium quam, vel ultrices ipsum libero eget urna.
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      zoomLevel: 1,
      zoomStep: 0.1,
      minZoom: 0.5,
      maxZoom: 3,
      panX: 0,
      panY: 0,
      isPanning: false,
      lastX: 0,
      lastY: 0,
      touches: [],
      currentTool: 'HAND', // Add this
      contentWidth: 0,
      contentHeight: 0,
      containerWidth: 0,
      containerHeight: 0,
    };
  },
  
  mounted() {
    this.updateDimensions();
    window.addEventListener('resize', this.updateDimensions);
  },

  beforeUnmount() {
    window.removeEventListener('resize', this.updateDimensions);
  },

  computed: {
    getCursor() {
      if (this.isPanning) return 'grabbing';
      if (this.currentTool === 'HAND') return 'grab';
      return 'zoom-in';
    },
    maxPanX() {
      return (this.contentWidth * this.zoomLevel - this.containerWidth) / (2 * this.zoomLevel);
    },
    maxPanY() {
      return (this.contentHeight * this.zoomLevel - this.containerHeight) / (2 * this.zoomLevel);
    }
  },

  methods: {
    zoomIn() {
      this.setZoom(this.zoomLevel + this.zoomStep);
    },
    zoomOut() {
      this.setZoom(this.zoomLevel - this.zoomStep);
    },
    resetZoom() {
      this.zoomLevel = 1;
      this.panX = 0;
      this.panY = 0;
    },
    setZoom(newZoom) {
      this.zoomLevel = Math.min(Math.max(newZoom, this.minZoom), this.maxZoom);
      this.constrainPan();
    },
    handleWheel(e) {
      if (this.currentTool === 'ZOOM') {
        const delta = -Math.sign(e.deltaY) * this.zoomStep;
        this.setZoom(this.zoomLevel + delta);
      } else if (this.currentTool === 'HAND') {
        this.panX += e.deltaX / this.zoomLevel;
        this.panY += e.deltaY / this.zoomLevel;
        this.constrainPan();
      }
    },
    startPan(e) {
      if (this.currentTool !== 'HAND') return;
      this.isPanning = true;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
    },
    pan(e) {
      if (!this.isPanning) return;
      const deltaX = (e.clientX - this.lastX) / this.zoomLevel;
      const deltaY = (e.clientY - this.lastY) / this.zoomLevel;
      this.panX += deltaX;
      this.panY += deltaY;
      this.lastX = e.clientX;
      this.lastY = e.clientY;
      this.constrainPan();
    },
    endPan() {
      this.isPanning = false;
    },
    handleTouchStart(e) {
      this.touches = [...e.touches];
      if (e.touches.length === 2) {
        e.preventDefault();
      }
    },
    handleTouchMove(e) {
      if (e.touches.length === 2) {
        const currentTouches = [...e.touches];
        const currentDistance = Math.hypot(
          currentTouches[0].clientX - currentTouches[1].clientX,
          currentTouches[0].clientY - currentTouches[1].clientY
        );
        const previousDistance = Math.hypot(
          this.touches[0].clientX - this.touches[1].clientX,
          this.touches[0].clientY - this.touches[1].clientY
        );
        const delta = (currentDistance - previousDistance) * 0.01;
        this.setZoom(this.zoomLevel + delta);
        this.touches = currentTouches;
      }
    },
    handleTouchEnd() {
      this.touches = [];
    },
    setTool(tool) {
      this.currentTool = tool;
    },
    updateDimensions() {
      const content = this.$el.querySelector('.inner');
      const container = this.$el.querySelector('.zoomable-wrapper');
      
      this.contentWidth = content.offsetWidth;
      this.contentHeight = content.offsetHeight;
      this.containerWidth = container.offsetWidth;
      this.containerHeight = container.offsetHeight;
    },

    constrainPan() {
      if (this.zoomLevel <= 1) {
        this.panX = 0;
        this.panY = 0;
        return;
      }

      this.panX = Math.min(Math.max(this.panX, -this.maxPanX), this.maxPanX);
      this.panY = Math.min(Math.max(this.panY, -this.maxPanY), this.maxPanY);
    }
  }
};
</script>

<style scoped>
.zoom-container {
  display: flex;
  flex-direction: column;
  height: 100%;
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

.zoomable-wrapper {
  position: relative;
  overflow: hidden;
  flex: 1;
  border: 1px solid #ccc;
}

.zoomable-content {
  transform-origin: center;
  transition: transform 0.2s ease-out;  /* Smoother transition for snap back */
  position: relative;
  width: 100%;
  height: 100%;
}

.inner {
  height: 512px;
  user-select: none;
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

.zoomable-wrapper.hand {
  cursor: grab;
}

.zoomable-wrapper.zoom {
  cursor: zoom-in;
}
</style>