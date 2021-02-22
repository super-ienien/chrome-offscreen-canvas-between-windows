function main () {
  const canvasDst = document.getElementById('canvasDst');
  const offscreen = canvasDst.transferControlToOffscreen();

  const sharedWorker = new SharedWorker("shared-worker.js", "a");
  let peerId, port, canvas, framebuffer;

  sharedWorker.onerror = function(error) {
    console.error("error in shared worker", error);
  };

  sharedWorker.port.onmessage = function (e) {
    if (e.data.kind === "connect") {
      peerId = e.data.peerId
        sharedWorker.port.postMessage({kind: "viewer-ready", peerId});
    } else if (e.data.kind === 'port') {
      port = e.data.port;
      port.onmessage = function (e) {
        console.log('message', e.data);
        if (e.data.kind === 'framebuffer') {
          framebuffer = e.data.framebuffer;
          debugger
        } else if (e.data.kind === 'bitmap') {
          console.log(Date.now() - e.data.ts, 'ms');
          updateCanvas(e.data.bitmap);
        }
      }
      port.postMessage({kind: "canvas", canvas: offscreen}, [offscreen]);
      port.postMessage({kind: "start-video"});
    }
  };

  function initCanvas(canvas) {

  }

  function updateCanvas(bitmap) {
    ctxDst.transferFromImageBitmap(bitmap);
  }

console.log('yo');
  sharedWorker.port.start();
}

main();
