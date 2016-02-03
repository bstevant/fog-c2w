var express = require('express');
var app = express();
var Redis = require("ioredis"),
    client = new Redis();


//////// Userlist class definition 
function UserList(re) { 
    this.re = re;
};
UserList.prototype.add = function (username, http_res) {
    var self = this;
    // Verify user unicity
    this.re.hexists("userlist", username).then(function (result) {
        if (result == "0") {
            reply= {
                code: "KO",
                msg: "User " + username + "already exists."
            };
            http_res.send(JSON.stringify(reply));
        } else {
            self.re.incr("next_ser_id").then(function (uid) {
                self.re.hset("userlist", username, uid);
                reply= {
                    code: "OK",
                    msg: ""
                };
                http_res.send(JSON.stringify(reply));
            });
        }
    });
};
UserList.prototype.get = function (http_res) {
    this.re.hkeys("userlist").then(function (replies) {
        reply= {
            code: "OK",
            msg: replies
        };
        http_res.send(JSON.stringify(reply));
    });
};
UserList.prototype.include = function (username, http_res) {
    self = this;
    this.re.hexists("userlist", username).then(function (result) {
    console.log(result);
    var reply = {};
    if (result != "0") {
        reply= {
            code: "KO",
            msg: "User " + username + " not included in userlist"
        };
    } else {
        reply= {
            code: "OK",
            msg: "User " + username + " included in userlist"
        };
    }});
    http_res.send(JSON.stringify(reply));
};
UserList.prototype.erase = function (http_res) {
    this.re.del("userlist");
    reply= {
        code: "OK",
        msg: ""
    };
    http_res.send(JSON.stringify(reply));
};


var ul = new UserList(client);

/////// Web-service definition
app.get('/', function (req, res) {
    res.send('OK This is the board.');
});

app.get('/add', function (req, res) {
    ul.add(req.query.u, res);
});

app.get('/get', function (req, res) {
    ul.get(res);
});

app.get('/include', function (req, res) {
    ul.include(req.query.u, res);
});

app.get('/erase', function (req, res) {
    ul.erase(res);
});

var server = app.listen(3040, function () {

  var host = server.address().address;
  var port = server.address().port;

  console.log('Example app listening at http://%s:%s', host, port);

  client.on("error", function (err) {
      console.log("Error " + err);
  });

});