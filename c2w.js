//var redis = require('redis');
//var re = redis.createClient();
var Redis = require("ioredis"),
    client = new Redis();

function Board(re) { 
    this.re = re;
};
Board.prototype.post = function (txt) {
    var self = this;
    this.re.incr("next_post_id").then(function (pid){
        self.re.zadd("posts",pid,"#" + pid + " " + txt);
    });
};
Board.prototype.get = function (last_idx) {
    this.re.zrange("posts", last_idx, -1).then(function (replies){
        replies.forEach(function (reply, i){
            console.log("POST: " + reply);
        });
    });
};
Board.prototype.erase = function () {
    return this.re.del("posts");
};

function UserList(re) { 
    this.re = re;
};
UserList.prototype.add = function (username) {
    // Verify user unicity
    var self = this;
    this.re.hexists("userlist", username).then(function (result) {
        if (result) {
            console.log("User " + username + " already exists");
        } else {
            self.re.incr("next_ser_id").then(function (uid) {
                self.re.hset("userlist", username, uid);                
            });
        }
    });
};
UserList.prototype.get = function () {
    this.re.hkeys("userlist").then(function (replies) {
        replies.forEach(function (reply, i){
            console.log("USER: " + reply);
        });
    });
};
UserList.prototype.erase = function () {
    return this.re.del("userlist");
};

function UI(username, b, ul) { 
    this.username = username;
    this.board = b;
    this.userlist = ul;
    this.userlist.add(username);
};
UI.prototype.post = function (txt) {
    this.board.post(this.username + " " + txt);
};
UI.prototype.print_board = function () {
    this.board.get(0);
    //console.log(posts);
};
UI.prototype.print_ul = function () {
    this.userlist.get();
};
UI.prototype.erase = function () {
    this.board.erase();
    this.userlist.erase();
};


var board = new Board(client);
var userlist = new UserList(client);

var readline = require('readline');
var rl = readline.createInterface(process.stdin, process.stdout);

var ui = [];
rl.setPrompt("username:");
rl.prompt();
rl.on('line', function(line) {
    if (ui instanceof Array) {
        ui = new UI(line, board, userlist);
        rl.setPrompt("### Command (p,u,r,q,0): ");
    } else {
        switch(line) {
        case "p":
            rl.question("Your voice: ", function(post){
                ui.post(post);                
            });
        break;
        case "u":
            ui.print_ul();
            break;
        case "q":
            process.exit(0);
            break;
        case "r":
            ui.print_board();
            break;
        case "0":
            ui.erase();
            break;
        default:
        }
    }
    rl.prompt();
}).on('close',function(){
    process.exit(0);
});
