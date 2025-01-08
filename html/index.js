var ImageEditor = tui.ImageEditor;

var instance = new ImageEditor('#tui-image-editor-container', {
    includeUI: {
        loadImage: {
            path: 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
            name: 'Blank'
        },
        initMenu: 'filter',
        menuBarPosition: 'bottom'
    },
    selectionStyle: {
        cornerSize: 20,
        rotatingPointOffset: 70
    }
});