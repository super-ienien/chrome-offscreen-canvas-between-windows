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

            // We create draw the video frame to the producer canvas
            ctxSrc.drawImage(video, 0, 0, width, height, 0, 0, width, height);

            // We create a bitmap from the producer canvas
            const bitmap = await createImageBitmap(canvasSrc);

            // We transfer the bitmpa to the offscreen canvas of the viewer
            ctxViewer.transferFromImageBitmap(bitmap);
        }

        video.src = url;
        video.requestVideoFrameCallback(videoFrameCallback);
        video.play();
    }

    port1.onmessage = function (e) {
        switch (e.data.kind) {
            case 'canvas':
                // The viewer sent his offscreen canvas.
                canvasViewer = e.data.canvas;
                ctxViewer = canvasViewer.getContext('bitmaprenderer');
            break;
            case 'start-video':
                // The viewer tell to start playing the video
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
            // We are connected to the shared worker
            peerId = e.data.peerId;
        } else if (e.data.kind === "viewer-ready") {
            // The viewer is ready we send him back the port2 of the channel
            setTimeout(function () {
                sharedWorker.port.postMessage({kind: 'port', port: channel.port2, peerId}, [channel.port2]);
            })
        }
    };

    sharedWorker.port.start();
}

main();
