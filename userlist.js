var express = require('express');
var app = express();
var Redis = require("ioredis"),
    client = new Redis();


//////// Userlist class definition 
function UserList(re) { 
    this.re = re;
};
UserList.prototype.add = function (username, http_res) {
    // Verify user unicity
    var self = this;
    this.re.hexists("userlist", username).then(function (result) {
        if (result) {
            http_res.send("KO: User " + username + " already exists");
        } else {
            self.re.incr("next_ser_id").then(function (uid) {
                self.re.hset("userlist", username, uid);
                http_res.send("OK");
            });
        }
    });
};
UserList.prototype.get = function (http_res) {
    this.re.hkeys("userlist").then(function (replies) {
        http_res.send("OK " + JSON.stringify(replies));
        //replies.forEach(function (reply, i){
        //    console.log("USER: " + reply);
        //});
    });
};
UserList.prototype.erase = function (http_res) {
    this.re.del("userlist");
    http_res.send("OK");
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