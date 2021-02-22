function main () {
  const canvasDst = document.getElementById('canvasDst');
  const offscreen = canvasDst.transferControlToOffscreen();

  const sharedWorker = new SharedWorker("shared-worker.js", "a");

  let peerId, port;

  sharedWorker.onerror = function(error) {
    console.error("error in shared worker", error);
  };

  sharedWorker.port.onmessage = function (e) {
    if (e.data.kind === "connect") {
      // We are connected to the shared worker
        peerId = e.data.peerId
      // We send to the viewer a ready message
      sharedWorker.port.postMessage({kind: "viewer-ready", peerId});
    } else if (e.data.kind === 'port') {
      // We received the message channel port from the producer
      port = e.data.port;
      // We send the offscreen canvas to the producer and tell him to start playing the video
      port.postMessage({kind: "canvas", canvas: offscreen}, [offscreen]);
      port.postMessage({kind: "start-video"});
    }
  };

  sharedWorker.port.start();
}

main();
