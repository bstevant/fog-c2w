var express = require('express');
var app = express();
var Redis = require("ioredis"),
    client = new Redis();


//////// Board class definition 
function Board(re) { 
    this.re = re;
};
Board.prototype.post = function (txt, http_res) {
    var self = this;
    this.re.incr("next_post_id").then(function (pid){
        self.re.zadd("posts",pid,"#" + pid + " " + txt);
        http_res.send('OK');
    });
};
Board.prototype.get = function (last_idx, http_res) {
    this.re.zrange("posts", last_idx, -1).then(function (replies){
//        replies.forEach(function (reply, i){
//            console.log("POST: " + reply);
//        });
        http_res.send("OK " + JSON.stringify(replies));
    });
};
Board.prototype.erase = function (http_res) {
    this.re.del("posts");
    http_res.send('OK');
};

var board = new Board(client);

/////// Web-service definition
app.get('/', function (req, res) {
    res.send('OK This is the board.');
});

app.get('/post', function (req, res) {
    board.post(req.query.p, res);
});

app.get('/get', function (req, res) {
    board.get(req.query.i,res);
});

app.get('/erase', function (req, res) {
    board.erase(res);
});

var server = app.listen(3030, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

  client.on("error", function (err) {
      console.log("Error " + err);
  });

});