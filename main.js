const express = require('express');
const app = express();
const port = 4242;

app.use(express.static('./src'));

app.listen(port, () => {
    console.log(`Open producer window at http://localhost:${port}/producer.html`);
    console.log(`Open viewer window at http://localhost:${port}/viewer.html`);
})
