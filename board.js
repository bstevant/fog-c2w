var express = require('express');
var app = express();
var http = require('http');
var querystring = require("querystring");
var Redis = require("ioredis"),
    client = new Redis();


//////// Board class definition 
function Board(re) { 
    this.re = re;
};
Board.prototype.post = function (username, txt, http_res) {
    var self = this;
    var options = {
        host: "127.0.0.1",
        port: "3040",
        path: "/include?" + querystring.stringify({u:username})
    };
    http.request(options, function (response) {
        var str = '';
        response.on('data', function (chunk) { str += chunk; });
        response.on('end', function () {
            var resp = JSON.parse(str); 
            if (resp && resp.code == "OK") {
                self.re.incr("next_post_id").then(function (pid){
                    self.re.zadd("posts",pid,"#" + pid + " " + txt);
                    reply= {
                        code: "OK",
                        msg: ""
                    };
                    http_res.send(JSON.stringify(reply));
                });
            } else {
                reply= {
                    code: "KO",
                    msg: "User not part of this board !"
                };
                http_res.send(JSON.stringify(reply));
            }
        });
    }).end();
};
Board.prototype.get = function (last_idx, http_res) {
    this.re.zrange("posts", last_idx, -1).then(function (replies){
        reply= {
            code: "OK",
            msg: replies
        };
        http_res.send(JSON.stringify(reply));
    });
};
Board.prototype.erase = function (http_res) {
    this.re.del("posts");
    reply= {
        code: "OK",
        msg: ""
    };
    http_res.send(JSON.stringify(reply));
};

var board = new Board(client);

/////// Web-service definition
app.get('/', function (req, res) {
    res.send('OK This is the board.');
});

app.get('/post', function (req, res) {
    board.post(req.query.u, req.query.p, res);
});

app.get('/get', function (req, res) {
    board.get(req.query.i, res);
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