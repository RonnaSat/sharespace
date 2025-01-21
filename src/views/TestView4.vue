<template>
  <div class="editor-container">
    <div class="toolbar">
      <button @click="addRectangle">Add Rectangle</button>
      <button @click="addCircle">Add Circle</button>
      <button @click="addText">Add Text</button>
      <button @click="toggleDrawing">Toggle Drawing</button>
      <input type="color" v-model="currentColor" />
      <input type="file" @change="uploadImage" accept="image/*" />
      <button @click="deleteSelected">Delete Selected</button>
    </div>
    <canvas id="canvas"></canvas>
  </div>
</template>

<script>
import { Canvas, Rect, Circle, IText, Image } from 'fabric';

export default {
  name: 'ImageEditor',
  data() {
    return {
      canvas: null,
      currentColor: '#000000',
      isDrawingMode: false
    };
  },
  mounted() {
    this.initCanvas();
  },
  methods: {
    initCanvas() {
      this.canvas = new Canvas('canvas', {
        width: 800,
        height: 600,
        backgroundColor: '#ffffff'
      });
    },
    addRectangle() {
      const rect = new Rect({
        left: 100,
        top: 100,
        width: 100,
        height: 100,
        fill: this.currentColor
      });
      this.canvas.add(rect);
      this.canvas.requestRenderAll();
    },
    addCircle() {
      const circle = new Circle({
        left: 100,
        top: 100,
        radius: 50,
        fill: this.currentColor
      });
      this.canvas.add(circle);
      this.canvas.requestRenderAll();
    },
    addText() {
      const text = new IText('Type here', {
        left: 100,
        top: 100,
        fill: this.currentColor
      });
      this.canvas.add(text);
      this.canvas.requestRenderAll();
    },
    toggleDrawing() {
      this.isDrawingMode = !this.isDrawingMode;
      this.canvas.isDrawingMode = this.isDrawingMode;
      if (this.canvas.freeDrawingBrush) {
        this.canvas.freeDrawingBrush.color = this.currentColor;
      }
    },
    deleteSelected() {
      const activeObject = this.canvas.getActiveObject();
      if (activeObject) {
        this.canvas.remove(activeObject);
        this.canvas.requestRenderAll();
      }
    },
    async uploadImage(e) {
      const file = e.target.files[0];
      const reader = new FileReader();
      
      reader.onload = async (f) => {
        try {
          const img = await Image.fromURL(f.target.result);
          img.scaleToWidth(300);
          this.canvas.add(img);
          this.canvas.requestRenderAll();
        } catch (error) {
          console.error('Error loading image:', error);
        }
      };
      
      reader.readAsDataURL(file);
    }
  },
  watch: {
    currentColor(newColor) {
      if (this.canvas.isDrawingMode && this.canvas.freeDrawingBrush) {
        this.canvas.freeDrawingBrush.color = newColor;
      }
    }
  }
};
</script>

<style scoped>
.editor-container {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
}

.toolbar {
  display: flex;
  gap: 0.5rem;
}

button {
  padding: 0.5rem 1rem;
  cursor: pointer;
}

canvas {
  border: 1px solid #ccc;
}
</style>
