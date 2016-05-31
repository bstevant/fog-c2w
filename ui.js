var querystring = require("querystring");
var http = require('http');
var str_command = "NOOP";
var last_recvd = "";
var last_status = "";

callback = function(response) {
  var str = '';

  //another chunk of data has been received, so append it to `str`
  response.on('data', function (chunk) {
    str += chunk;
  });

  //the whole response has been received, so we just print it out here
  response.on('end', function () {
      var resp = JSON.parse(str);
      if (resp) {
          last_status = resp.code;
          last_recvd = resp.msg;
      } else {
          last_status = "KO";
          last_recvd = "Bad response from server";
      }
      if (resp.msg instanceof Array) {
          resp.msg.forEach(function(l, i) {
              console.log(str_command + " " + last_status + " : " + l);
          });
      } else {
          console.log(str_command + " " + last_status + " : " + last_recvd);
      }
  });
}



function BoardUI(host, port) { 
    this.host = host;
    this.port = port;
};
BoardUI.prototype.post = function (username, txt) {
    var self = this;
    var options = {
        host: this.host,
        port: this.port,
        path: "/post?" + querystring.stringify({u:username, p:txt})
    };
    str_command = "POST"
    http.request(options,callback).end();
};
BoardUI.prototype.get = function (last_idx) {
    var self = this;
    var options = {
        host: this.host,
        port: this.port,
        path: "/get?" + querystring.stringify({i:last_idx})
    };
    str_command = "BOARD"
    http.request(options,callback).end();
};
BoardUI.prototype.erase = function () {
    var options = {
        host: this.host,
        port: this.port,
        path: "/erase"
    };
    str_command = "RAZB"
    http.request(options,callback).end();
};

function UserListUI(host, port) { 
    this.host = host;
    this.port = port;
};
UserListUI.prototype.add = function (username) {
    var self = this;
    var options = {
        host: this.host,
        port: this.port,
        path: "/add?" + querystring.stringify({u:username})
    };
    str_command = "UADD"
    http.request(options,callback).end();
};
UserListUI.prototype.get = function () {
    var options = {
        host: this.host,
        port: this.port,
        path: "/get"
    };
    str_command = "ULIST"
    http.request(options,callback).end();
};
UserListUI.prototype.erase = function () {
    var options = {
        host: this.host,
        port: this.port,
        path: "/erase"
    };
    str_command = "RAZUL"
    http.request(options,callback).end();
};


function UI(username, b, ul) { 
    this.username = username;
    this.board = b;
    this.userlist = ul;
    this.userlist.add(username);
};
UI.prototype.post = function (txt) {
    this.board.post(this.username, txt);
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


var board = new BoardUI("c2w-board.service.consul", "3030");
var userlist = new UserListUI("c2w-userlist.service.consul", "3040");

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
