const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.urlencoded({ extended: false }))

app.use(bodyParser.json())

app.get('/prebid_statistic_script', (req, res) => {
    res.sendFile(path.join(__dirname, '/prebid_statistic.js'));
});

app.post('/url', function(req, res) {
    console.log(req.body.url);
    res.sendStatus(200)
});

app.listen(port);
console.log('Server started at http://localhost:' + port);