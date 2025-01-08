<template>
  <div
    style="
      display: flex;
      flex-direction: column;
      align-items: center;
      margin-top: 3rem;
      margin-bottom: 3rem;
    "
  >
    <input type="file" @change="onFileSelected" accept="image/*" />
    <div class="">
      <div v-if="reconstructedImageDataUrl">
        <h3>Image from Tensor:</h3>
        <img
          :src="reconstructedImageDataUrl"
          alt="Reconstructed from Tensor"
          style="width: 1024px"
        />
      </div>
      <div v-if="imageBeforeEmboss">
        <h3>Before Embossed Image:</h3>
        <img
          :src="imageBeforeEmboss"
          alt="Embossed Image from Tensor"
          style="width: 1024px"
        />
      </div>
      <div v-if="embossImage">
        <h3>Embossed Image:</h3>
        <img
          :src="embossImage"
          alt="Embossed Image from Tensor"
          style="width: 1024px"
        />
      </div>
      <div>
        <div style="margin-top: 3rem; margin-bottom: 3rem">
          <h3>Emboss Kernel:</h3>
          <button @click="reProcess">Apply Emboss Filter</button>
          <table>
            <tbody>
              <tr v-for="(row, i) in embossKernelRef" :key="i">
                <td v-for="(col, j) in row" :key="j">
                  <input type="number" v-model.number="embossKernelRef[i][j]" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-wasm";
// import "@tensorflow/tfjs-backend-webgpu";
import { ref, reactive, onMounted } from "vue";

const selectedFile = ref(null);
const imageDataUrl = ref(null);
const reconstructedImageDataUrl = ref(null);
const imageBeforeEmboss = ref(null);
const embossImage = ref(null);
const embossKernelRef = reactive([
  [0, 0, -1],
  [0, 0, 0],
  [1, 0, 0],
]);

const onFileSelected = (event) => {
  selectedFile.value = event.target.files[0];
  const reader = new FileReader();
  reader.onload = (e) => {
    imageDataUrl.value = e.target.result;
    convertImageToTensor();
  };
  reader.readAsDataURL(selectedFile.value);
};

const convertImageToTensor = async () => {
  if (!selectedFile.value) return;

  const reader = new FileReader();
  reader.onload = async (e) => {
    const img = new Image();
    img.onload = async () => {
      const time1 = performance.now();

      const maxWidth = 1024;
      let width = img.width;
      let height = img.height;

      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, width, height);

      let tensor = tf.browser.fromPixels(canvas);
      await processImageTest(tensor);
      tensor.dispose();

      const time2 = performance.now();
      console.log("Time taken:", time2 - time1);
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(selectedFile.value);
};

const tensorToImageDataUrl = async (tensor) => {
  const tensorWithoutBatch = tensor.squeeze();
  const pixels = await tf.browser.toPixels(tensorWithoutBatch);

  const canvas = document.createElement("canvas");
  canvas.width = tensorWithoutBatch.shape[1];
  canvas.height = tensorWithoutBatch.shape[0];
  const ctx = canvas.getContext("2d");

  const imageData = new ImageData(
    new Uint8ClampedArray(pixels),
    canvas.width,
    canvas.height
  );
  ctx.putImageData(imageData, 0, 0);

  const dataUrl = canvas.toDataURL();
  tensorWithoutBatch.dispose();

  return dataUrl;
};

const applyEmbossFilter = async (tensor) => {
  const float32Tensor = tf.cast(tensor, "float32").div(tf.scalar(255));

  const embossKernel = tf.tensor2d(embossKernelRef, [3, 3], "float32");

  const channels = tensor.shape[2];
  const embossKernels = embossKernel
    .reshape([3, 3, 1, 1])
    .tile([1, 1, channels, 1]);

  let embossedTensor = float32Tensor
    .expandDims(0)
    .conv2d(embossKernels, 1, "same")
    .squeeze();

  const min = embossedTensor.min();
  const max = embossedTensor.max();
  embossedTensor = embossedTensor.sub(min).div(max.sub(min));

  return tensorToImageDataUrl(embossedTensor);
};

const processImageTest = async (tensor) => {
  try {
    const [imageDataUrl, embossedImage] = await Promise.all([
      tensorToImageDataUrl(tensor),
      applyEmbossFilter(tensor),
    ]);

    reconstructedImageDataUrl.value = imageDataUrl;
    embossImage.value = embossedImage;
    console.log(embossImage.value);
    
  } catch (error) {
    console.error("Error in processImageTest:", error);
    throw error;
  } finally {
    tensor.dispose();
  }
};

const reProcess = async () => {
  convertImageToTensor();
};

onMounted(async () => {
  try {
    await tf.setBackend("wasm");
    await tf.ready();
  } catch (error) {
    await tf.ready();
    console.log("Error in set webgpu backend: ", error);
  }

  console.log('Active backend:', tf.getBackend());
});

</script>

<style scoped></style>