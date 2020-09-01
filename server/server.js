const path = require('path');
const express = require('express');
const fs = require('fs');
const app = express();

const port = process.env.PORT || 3000;

const publicPath = path.join(__dirname, '..' , 'public');
app.use(express.static(publicPath));

app.get('/', (req, res) => {
  res.sendFile(path.join(publicPath, 'dist', 'index.html'));
});

app.listen(port, () => console.log(`Listenting of port ${port}`));