import * as tf from "@tensorflow/tfjs";
import { addObjectUrl } from './objectUrlStore';

const embossKernelRef = [
    [0, 0, -2],
    [0, 0, 0],
    [2, 0, 0],
];

const reverseEmbossKernelRef = [
    [0, 0, 2],
    [0, 0, 0],
    [-2, 0, 0],
];

const setBackend = async () => {
    await tf.ready();
    console.log("Active backend:", tf.getBackend());
};

const resizeImage = (tensor) => {
    const [height, width] = tensor.shape;
    if (width <= 1024) return tensor;

    const aspectRatio = height / width;
    const newWidth = 1024;
    const newHeight = Math.round(newWidth * aspectRatio);

    return tf.image.resizeBilinear(tensor, [newHeight, newWidth]);
};

export const applyEmboss = async (file, embossType = 'normal', resize = false) => {
    if (!file || !(file instanceof File)) return;
    const time1 = performance.now();
    await setBackend();

    const bitmap = await createImageBitmap(file);
    
    
    let tensor = tf.browser.fromPixels(bitmap);
    bitmap.close();

    // Only resize if the flag is true
    if (resize) {
        const resizedTensor = resizeImage(tensor);
        if (tensor !== resizedTensor) {
            tensor.dispose();
            tensor = resizedTensor;
        }
    }

    const emboss = await processImageTest(tensor, embossType);

    const time2 = performance.now();
    console.log("Time taken:", time2 - time1);
    return emboss;
};

const processImageTest = async (tensor, embossType) => {
    try {
        return await applyEmbossFilter(tensor, embossType);
    } catch (error) {
        console.error("Error in processImageTest:", error);
        throw error;
    } finally {
        tensor.dispose();
    }
};

const applyEmbossFilter = async (tensor, embossType) => {
    const t1 = performance.now();
    const float32Tensor = tf.cast(tensor, "float32").div(tf.scalar(255));
    const kernelRef = embossType === 'reverse' ? reverseEmbossKernelRef : embossKernelRef;
    const embossKernel = tf.tensor2d(kernelRef, [3, 3], "float32");
    const channels = tensor.shape[2];
    const embossKernels = embossKernel
        .reshape([3, 3, 1, 1])
        .tile([1, 1, channels, 1]);

    let embossedTensor = float32Tensor
        .expandDims(0)
        .conv2d(embossKernels, 1, "same")
        .squeeze();

    const strength = 1;
    embossedTensor = embossedTensor.mul(tf.scalar(strength));

    embossedTensor = embossedTensor.add(0.5);
    embossedTensor = embossedTensor.clipByValue(0, 1);

    const t2 = performance.now();
    console.log("Time taken to apply emboss filter:", t2 - t1);

    return tensorToImage(embossedTensor);
};

const tensorToImage = async (tensor) => {
    const t1 = performance.now();

    const canvas = new OffscreenCanvas(tensor.shape[1], tensor.shape[0]);

    await tf.browser.toPixels(tensor, canvas);

    const blob = await canvas.convertToBlob({
        type: 'image/jpeg',
        quality: 0.9
    });
    const dataUrl =  addObjectUrl(URL.createObjectURL(blob));
    tensor.dispose();

    const t2 = performance.now();

    console.log("Time taken to convert tensor to image:", t2 - t1);
    return dataUrl;
};


