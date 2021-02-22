function main () {
    const canvasSrc = document.getElementById('canvasSrc');
    const ctxSrc = canvasSrc.getContext('2d');
    let canvasViewer;
    let ctxViewer;
    let video;
    let width = 0;
    let height = 0;
    let peerId;
    const channel = new MessageChannel();
    const port1 = channel.port1;

    function setup(url) {

        //we create a video element not connected to the DOM
        video = document.createElement('video');
        video.autoplay = true;
        video.muted = true;
        video.loop = true;
        video.addEventListener('loadedmetadata', function () {
            width = video.videoWidth;
            height = video.videoHeight;
        });

        async function videoFrameCallback () {
            video.requestVideoFrameCallback(videoFrameCallback);
            ctxSrc.drawImage(video, 0, 0, width, height, 0, 0, width, height);
            const bitmap = await createImageBitmap(canvasSrc);
            ctxViewer.transferFromImageBitmap(bitmap);
        }

        video.src = url;
        video.requestVideoFrameCallback(videoFrameCallback);
        video.play();
    }

    port1.onmessage = function (e) {
        console.log('port message', e);
        switch (e.data.kind) {
            case 'canvas':
                console.log('canvas-video');
                canvasViewer = e.data.canvas;
                ctxViewer = canvasViewer.getContext('bitmaprenderer');
            break;
            case 'start-video':
                console.log('start-video');
                setup('test.mp4');
            break;
        }
    };

    const sharedWorker = new SharedWorker("shared-worker.js", "a");

    sharedWorker.onerror = function(error) {
        console.error("error in worker", error);
    };

    sharedWorker.port.onmessage = function (e) {
        if (e.data.kind === 'connect') {
            peerId = e.data.peerId;
        } else if (e.data.kind === "viewer-ready") {
            setTimeout(function () {
                sharedWorker.port.postMessage({kind: 'port', port: channel.port2, peerId}, [channel.port2]);
            })
        }
    };

    sharedWorker.port.start();
}

main();
