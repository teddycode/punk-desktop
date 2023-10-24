// 处理ws客户端
const http = require("http");
const net = require('net');
const url = require('url');
const path = require('path');
const fs = require('fs');
const mime = require('mime-types');
const WebSocketServer = require('ws').Server;

let source_host = 'localhost';
let source_port = '5901';
let target_host = 'localhost';
let target_port = '5905';
let web_dir = './noVNC'

// TODO 实现服务端：https://github.com/sidorares/node-rfb2
function new_client(client, req) {
  var clientAddr = client._socket.remoteAddress, log;

  console.log(req ? req.url : client.upgradeReq.url);
  log = function (msg) {
    console.log(' ' + clientAddr + ': ' + msg);
  };
  log('WebSocket connection');
  log('Version ' + client.protocolVersion + ', subprotocol: ' + client.protocol);

  var target = net.createConnection(target_port, target_host, () => {
    log('connected to target');
  });
  target.on('data', (data) => {
    //log("sending message: " + data);
    try {
      client.send(data);
    } catch (e) {
      log("Client closed, cleaning up target");
      target.end();
    }
  });
  target.on('end', (data) => {
    log('target disconnected:', data);
    client.close();
  });
  target.on('error', (err) => {
    log('target connection error:', err);
    target.end();
    client.close();
  });

  client.on('message', (msg) => {
    //log('got message: ' + msg);
    target.write(msg);
  });
  client.on('close', (code, reason) => {
    log('WebSocket client disconnected: ' + code + ' [' + reason + ']');
    target.end();
  });
  client.on('error', (error) => {
    log('WebSocket client error: ' + error);
    target.end();
  });
}

// Send an HTTP error response
function http_error(response, code, msg) {
  response.writeHead(code, {"Content-Type": "text/plain"});
  response.write(msg + "\n");
  response.end();

}

// Process an HTTP static file request
function http_request(request, response) {
//    console.log("pathname: " + url.parse(req.url).pathname);
//    res.writeHead(200, {'Content-Type': 'text/plain'});
//    res.end('okay');

  var uri = url.parse(request.url).pathname
    , filename = path.join(web_dir, uri);

  fs.exists(filename, function (exists) {
    if (!exists) {
      return http_error(response, 404, "404 Not Found");
    }

    if (fs.statSync(filename).isDirectory()) {
      filename += '/index.html';
    }

    fs.readFile(filename, "binary", function (err, file) {
      if (err) {
        return http_error(response, 500, err);
      }

      var headers = {};
      var contentType = mime.contentType(path.extname(filename));
      if (contentType !== false) {
        headers['Content-Type'] = contentType;
      }

      response.writeHead(200, headers);
      response.write(file, "binary");
      response.end();
    });
  });
}

function startWebsocketRelay() {

  console.log("WebSocket settings: ");
  console.log("    - proxying from " + source_host + ":" + source_port +
    " to " + target_host + ":" + target_port);
  console.log("    - Web server active. Serving: " + web_dir);
  console.log("    - Running in unencrypted HTTP (ws://) mode");
  let webServer = http.createServer(http_request);
  webServer.listen(source_port, () => {
    let wsServer = new WebSocketServer({server: webServer});
    wsServer.on('connection', new_client);
  });

}

startWebsocketRelay();

