import express from 'express';
import {Topic} from './models/Topic';
import {Socket} from 'socket.io';
import {Lobby} from './models/Lobby';
import {LobbyRequest} from './models/lobbyRequest';
import {Errors} from './models/Errors';
import {UserAction} from './models/UserAction';


// rest of the code remains same
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http, {
  cors: {
    origin: '*',
  }
});
const _ = require('lodash');
const PORT = 8000;

const development = true;
const redirectUrl = (development) ? 'http://localhost:4200' : 'http://dixit.katorek.ddns.net';

const lobbies = new Map<string, Lobby>();

if (development) {
  lobbies.set('test1', {
    name: 'name',
    hostId: 'host_id',
    users: [{id: 'host_id', username: 'host'}]
  });
}

app.get('/', (req, res) => {
  res.send('' +
    '<html lang="pl">' +
    '  <head>' +
    '    <meta http-equiv="Refresh" content="3; url=' + redirectUrl + '" />' +
    '    <title>Dixit Online</title>  ' +
    '  </head>' +
    '  <body>' +
    '    <p>Automatyczne przkierowanie w przeciągu <span id="countdown">3</span> sekund</p>' +
    '  </body>' +
    '</html>' +
    '');
});

app.listen(PORT, () => {
  console.log(`⚡️[server]: Server is running at http://localhost:${PORT}`);
});

io.on('connection', (socket: Socket) => {

  socket.on(Topic.GET_LOBBIES, () => {
    sendLobbies();
  });

  socket.on(Topic.CREATE_LOBBY, (data: LobbyRequest) => {
    createLobby(data);
  });

  socket.on(Topic.JOIN_LOBBY, (data: LobbyRequest) => {
    joinLobby(data);
  });

  socket.on(Topic.LOBBY_INFO, (data: LobbyRequest) => {
    sendLobbyInfo(data.lobbyName);
  });

});

function sendMessage(topic: string, data: any) {
  console.log('Sending on [' + topic + '], data:', data);
  io.emit(topic, data);
}

function err(msg: string, title: string, error: Errors) {
  return {msg, title, error};
}

function sendLobbies(): void {
  const data = {
    lobbies: Array.from(lobbies.keys())
  };
  sendMessage(Topic.LIST_LOBBIES, data);
}

function createLobby(data: LobbyRequest) {
  if (lobbies.has(data.lobbyName)) {
    console.log('Lobby ' + data.lobbyName + ' already exists !');
    sendErrorToUser(data.userId, err('Lobby ' + data.lobbyName + ' already exists !', 'Error', Errors.LOBBY_ALREADY_EXISTS));
  } else {
    lobbies.set(data.lobbyName, newLobby(data));
    sendMessage(data.userId, {type: UserAction.JOIN_LOBBY, lobbyName: data.lobbyName});
  }
  sendLobbies();
}

function newLobby(lobbyRequest: LobbyRequest): Lobby {
  return {
    name: lobbyRequest.lobbyName,
    hostId: lobbyRequest.userId,
    users: [{id: lobbyRequest.userId, username: lobbyRequest.username}]
  };
}

function joinLobby(data: LobbyRequest) {
  addUserToLobby(data);
  sendMessage(data.userId, {type: UserAction.JOIN_LOBBY, lobbyName: data.lobbyName});
}

function addUserToLobby(data: LobbyRequest) {
  if (!lobbies.has(data.lobbyName)) {
    sendErrorToUser(data.userId, err('Lobby not found', 'Error', Errors.LOBBY_NOT_FOUND));
  } else {
    lobbies.get(data.lobbyName)?.users.push({id: data.userId, username: data.username});
  }
}

function sendLobbyInfo(lobbyName: string) {
  sendMessage('lobby-' + lobbyName, lobbies.get(lobbyName));
}

function sendErrorToUser(userId: string, data: any) {
  io.emit('error-' + userId, data);
}

http.listen(3000, () => {
  console.log('listening on *:3000');
});
