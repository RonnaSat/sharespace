<template>
    <div class="body-container">
        <div class="tui-image-editor-controls">
            <div class="header">
                <img class="logo" src="../examples/img/TOAST UI Component.png" />
                <span class="name">Image Editor</span>
                <ul class="menu">
                    <li class="menu-item border input-wrapper">
                        Load
                        <input type="file" accept="image/*" id="input-image-file" />
                    </li>
                    <li class="menu-item border" id="btn-download">Download</li>
                </ul>
            </div>
            <ul class="menu">
                <li class="menu-item disabled" id="btn-undo">Undo</li>
                <li class="menu-item disabled" id="btn-redo">Redo</li>
                <li class="menu-item" id="btn-clear-objects">ClearObjects</li>
                <li class="menu-item" id="btn-remove-active-object">RemoveActiveObject</li>
                <li class="menu-item" id="btn-crop">Crop</li>
                <li class="menu-item" id="btn-flip">Flip</li>
                <li class="menu-item" id="btn-rotation">Rotation</li>
                <li class="menu-item" id="btn-draw-line">DrawLine</li>
                <li class="menu-item" id="btn-draw-shape">Shape</li>
                <li class="menu-item" id="btn-add-icon">Icon</li>
                <li class="menu-item" id="btn-text">Text</li>
                <li class="menu-item" id="btn-mask-filter">Mask</li>
                <li class="menu-item" id="btn-image-filter">Filter</li>
            </ul>
        </div>
        <div id="tui-image-editor"></div>
        <div class="sub-menu-container" id="image-filter-sub-menu">
            <ul class="menu">
                <li class="menu-item align-left-top">
                    <table>
                        <tbody>
                            <tr>
                                <td><label><input type="checkbox" id="input-check-grayscale" />Grayscale</label></td>
                                <td><label><input type="checkbox" id="input-check-invert" />Invert</label></td>
                                <td><label><input type="checkbox" id="input-check-sepia" />Sepia</label></td>
                            </tr>
                            <tr>
                                <td><label><input type="checkbox" id="input-check-sepia2" />Sepia2</label></td>
                                <td><label><input type="checkbox" id="input-check-blur" />Blur</label></td>
                                <td><label><input type="checkbox" id="input-check-sharpen" />Sharpen</label></td>
                            </tr>
                            <tr>
                                <td><label><input type="checkbox" id="input-check-emboss" />Emboss</label></td>
                            </tr>
                        </tbody>
                    </table>
                </li>
                <li class="menu-item close">Close</li>
            </ul>
        </div>
    </div>
</template>

<script setup>
import { onMounted } from 'vue';

onMounted(() => {
    imageEditorInit();
});
// too fix performance issue, need to write script that avoid vue reactivity (ref, reactive, etc)
const imageEditorInit = () => {
    const imageEditor = new window.tui.ImageEditor('#tui-image-editor', {
        cssMaxWidth: 700,
        cssMaxHeight: 500,
        usageStatistics: false,
    });

    // Add event listeners
    document.querySelector('#input-image-file').addEventListener('change', (e) => {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onload = () => {
            imageEditor.loadImageFromFile(file);
        };
        reader.readAsDataURL(file);
    });

    document.querySelector('#btn-download').addEventListener('click', () => {
        imageEditor.downloadImage();
    });

    // Add undo/redo event listeners
    document.querySelector('#btn-undo').addEventListener('click', () => {
        if (!document.querySelector('#btn-undo').classList.contains('disabled')) {
            imageEditor.undo();
        }
    });

    document.querySelector('#btn-redo').addEventListener('click', () => {
        if (!document.querySelector('#btn-redo').classList.contains('disabled')) {
            imageEditor.redo();
        }
    });

    // Add state change listener to enable/disable undo/redo buttons
    imageEditor.on('undoStackChanged', function (length) {
        if (length) {
            document.querySelector('#btn-undo').classList.remove('disabled');
        } else {
            document.querySelector('#btn-undo').classList.add('disabled');
        }
        document.querySelector('#btn-redo').classList.add('disabled');
    });

    imageEditor.on('redoStackChanged', function (length) {
        if (length) {
            document.querySelector('#btn-redo').classList.remove('disabled');
        } else {
            document.querySelector('#btn-redo').classList.add('disabled');
        }
    });

    // Add filter event listeners
    document.querySelector('#btn-image-filter').addEventListener('click', () => {
        const filterSubMenu = document.querySelector('#image-filter-sub-menu');
        filterSubMenu.style.display = filterSubMenu.style.display === 'none' ? 'block' : 'none';
    });

    // Update the filter event handlers
    const filterHandlers = {
        'input-check-grayscale': 'grayscale',
        'input-check-invert': 'invert',
        'input-check-sepia': 'sepia',
        'input-check-sepia2': 'sepia2',
        'input-check-blur': 'blur',
        'input-check-sharpen': 'sharpen',
        'input-check-emboss': 'emboss'
    };

    Object.entries(filterHandlers).forEach(([id, filterName]) => {
        document.querySelector(`#${id}`).addEventListener('change', (e) => {
            if (e.target.checked) {
                imageEditor.applyFilter(filterName, true);
            } else {
                imageEditor.removeFilter(filterName);
            }
        });
    });

    document.querySelector('.close').addEventListener('click', () => {
        document.querySelector('#image-filter-sub-menu').style.display = 'none';
    });
}
</script>

<style>
.border {
    border: 1px solid black;
}

.body-container {
    width: 1000px;
}

.tui-image-editor-controls {
    min-height: 250px;
}

.menu {
    padding: 0;
    margin-bottom: 5px;
    text-align: center;
    color: #544b61;
    font-weight: 400;
    list-style-type: none;
    user-select: none;
}

.logo {
    margin: 0 auto;
    width: 300px;
    vertical-align: middle;
}

.header .name {
    padding: 10px;
    line-height: 50px;
    font-size: 30px;
    font-weight: 100;
    vertical-align: middle;
}

.header .menu {
    display: inline-block;
}

.menu-item {
    padding: 10px;
    display: inline-block;
    cursor: pointer;
    vertical-align: middle;
}

.menu-item.disabled {
    cursor: default;
    color: #bfbebe;
}

.input-wrapper {
    position: relative;
}

.input-wrapper input {
    cursor: pointer;
    position: absolute;
    font-size: 999px;
    left: 0;
    top: 0;
    opacity: 0;
    width: 100%;
    height: 100%;
    overflow: hidden;
}

#tui-image-editor {
    height: 500px;
}

.tui-image-editor-canvas-container {
    margin: 0 auto;
    top: 50%;
    transform: translateY(-50%);
    border: 1px dashed black;
    overflow: hidden;
}

.sub-menu-container {
    font-size: 14px;
    margin-bottom: 1em;
    display: none;
}

.align-left-top {
    text-align: left;
    vertical-align: top;
}

table {
    border-collapse: collapse;
}

td {
    padding: 10px;
}

.close {
    cursor: pointer;
    color: #fff;
    background-color: #666;
}
</style>
