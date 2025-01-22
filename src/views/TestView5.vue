<template>
  <canvas id="main-canvas" width="800" height="600"></canvas>
  <table>
    <tr v-for="box in boxList" :key="box.id">
      <td>{{ box.get("id") }}</td>
      <td>{{ box.get("left") }}</td>
      <td>{{ box.get("description") }}</td>
    </tr>
  </table>
  <button @click="addBox">Add</button>
</template>

<script setup>
import { ref, onMounted } from "vue";
import * as fabric from "fabric";

// Reactive data
const boxList = ref([]);
let canvas = null;

class TestRect extends fabric.Rect {
  constructor(options) {
    super(options);
    this.set("id", options.id);
    this.set("description", "default-description");
  }
}

// Lifecycle hook
onMounted(() => {
  canvas = new fabric.Canvas("main-canvas");
  canvas.on("object:modified", (event) => {
    console.log("modified");
    event.target.set("description", "new-description");
  });
});

// Methods
const addBox = () => {
  let new_box = new TestRect({
    left: 10,
    top: 10,
    width: 30,
    height: 40,
    fill: "green",
    id: new Date().toISOString(),
  });

  canvas.add(new_box);
  boxList.value.push(new_box);
  canvas.renderAll();
};
</script>

<style>
canvas {
  border: 1px dotted red;
}

table tr,
table td {
  border: 1px solid black;
}
</style>
