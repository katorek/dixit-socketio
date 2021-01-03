import express from 'express';
import {Topic} from './models/Topic';
import {Socket} from 'socket.io';
import {Lobby} from './models/Lobby';
import {LobbyRequest} from './models/lobbyRequest';
import {Errors} from './models/Errors';
import {UserAction} from './models/UserAction';
import {User} from './models/User';
import {ConnectionState} from './models/connection-state';
import {Mutex, Semaphore, withTimeout} from 'async-mutex';


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
const connectedUsers = new Map<string, User>();

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

  socket.on(Topic.UPDATE_USER, async (userData: User) => {
    if (!userData.mutex) {
      userData.mutex = new Mutex();
    }
    const release = await userData.mutex.acquire();
    try {
      userData.wsId = socket.id;
      userData.connectionState = ConnectionState.ALIVE;

      connectedUsers.set(userData.id, userData);
      if (userData.lobbyName) {
        updateLobbiesForUser(userData);
        sendLobbyInfo(userData.lobbyName);
      }
    } finally {
      release();
    }
  });

  // development helper, todo to be removed
  socket.on(Topic.DEBUG_DATA_RESET, () => {
    developmentSetUp();
  });

  socket.on(Topic.DEBUG_PRINT_USERS, () => {
    console.log('users: ', connectedUsers);
  });
  socket.on(Topic.DEBUG_PRINT_LOBBIES, () => {
    lobbies.forEach(l => console.log('lobby: ', l.name, l.usersIds));
  });


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

  socket.on('disconnect', () => {
    const user = getUserBySocketId(socket.id);
    if (user) {
      user.connectionState = ConnectionState.SUSPECTED_LOST;
      connectedUsers.set(user.id, user);
      console.log('User disconnected', user);
      sendLobbyInfo(user.lobbyName);
    } else {
      console.log('Someone disconnected', socket.id);
    }
  });

});

function getUserBySocketId(wsId: string) {
  for (const user of connectedUsers.values()) {
    if (user.wsId === wsId) {
      return user;
    }
  }
}

function developmentSetUp() {
  const user: User = new User('host_id', 'host');
  connectedUsers.clear();
  connectedUsers.set('host_id', user);
  lobbies.clear();
  lobbies.set('test1', {
    name: 'name',
    hostId: 'host_id',
    usersIds: [user.id]
  });
  sendLobbies();
}

if (development) {
  developmentSetUp();
}

function sendMessage(topic: string, data: any) {
  if (development) {
    console.log('Sending on [' + topic + '], data:', data);
  }
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
    sendErrorToUser(data.id, err('Lobby ' + data.lobbyName + ' already exists !', 'Error', Errors.LOBBY_ALREADY_EXISTS));
  } else {
    lobbies.set(data.lobbyName, newLobby(data));
    sendMessage(data.id, {type: UserAction.JOIN_LOBBY, lobbyName: data.lobbyName});
  }
  sendLobbies();
}

function updateUser(user: User) {
  connectedUsers.set(user.id, user);
}

function newLobby(lobbyRequest: LobbyRequest): Lobby {
  const user = connectedUsers.get(lobbyRequest.id);
  if (user) {
    user.lobbyName = lobbyRequest.lobbyName;
    updateUser(user);
    return {
      name: lobbyRequest.lobbyName,
      hostId: lobbyRequest.id,
      usersIds: [user.id]
    };
  }
  return {
    name: lobbyRequest.lobbyName,
    hostId: lobbyRequest.id,
    usersIds: []
  };

}

function joinLobby(data: LobbyRequest) {
  addUserToLobby(data);
  sendMessage(data.id, {type: UserAction.JOIN_LOBBY, lobbyName: data.lobbyName});
}

function addUserToLobby(data: LobbyRequest) {
  if (!lobbies.has(data.lobbyName)) {
    sendErrorToUser(data.id, err('Lobby not found', 'Error', Errors.LOBBY_NOT_FOUND));
  } else {
    const user = connectedUsers.get(data.id);
    if (user) {
      user.lobbyName = data.lobbyName;
      updateUser(user);
      const idx = lobbies.get(data.lobbyName)?.usersIds.findIndex(u => u === user.id);
      if (idx === -1) {
        lobbies.get(data.lobbyName)?.usersIds.push(user.id);
      }
    }
  }
}

function sendLobbyInfo(lobbyName?: string) {
  if (lobbyName && lobbies.get(lobbyName)) {
    const lobby = lobbies.get(lobbyName);
    if (lobby !== undefined) {
      lobby.users = getLobbyUsers(lobbyName);
      console.log('lobby', lobby);
    }
    sendMessage('lobby-' + lobbyName, lobby);
  }
}

function getLobbyUsers(lobbyName: string): User[] {
  console.log('getLobbyUsers', lobbies.get(lobbyName)?.usersIds.map(id => connectedUsers.get(id)));
  // @ts-ignore
  return lobbies.get(lobbyName)?.usersIds.map(id => connectedUsers.get(id) ?? null);
}

function sendErrorToUser(userId: string, data: any) {
  io.emit('error-' + userId, data);
}

http.listen(3000, () => {
  console.log('listening on *:3000');
});

const second = 1000;

function updateLobbiesForUser(user: User) {
  lobbies.forEach(l => {
    const idx = l.usersIds.findIndex(u => u === user.id);
    if (idx !== -1) {
      l.usersIds[idx] = user.id;
    }
  });
}

function removeUserFromLobby(user: User) {
  lobbies.forEach(l => {
    const idx = l.usersIds.findIndex(u => u === user.id);
    if (idx !== -1) {
      l.usersIds.splice(idx, 1);
      user.lobbyName = undefined;
      if (user.id === l.hostId) {
        if (l.usersIds.length > 0) {
          l.hostId = l.usersIds[0];
          lobbies.set(l.name, l);
        } else {
          lobbies.delete(l.name);
          sendLobbies();
        }
      }
    }
    sendLobbyInfo(l.name);
  });
}

setInterval(() => {
  console.log('cleaning');
  connectedUsers.forEach(user => {
    if (!user.mutex) {
      user.mutex = new Mutex();
      connectedUsers.set(user.id, user);
    }

    async function f() {
      const release = await user.mutex.acquire();
      try {
        if (user.connectionState === ConnectionState.LOST) {
          console.log('removing user from lobby etc.');
          user.connectionState = ConnectionState.UNDEFINED;
          removeUserFromLobby(user);
          // remove from lobby
          connectedUsers.set(user.id, user);
        } else if (user.connectionState > 1) { // 0 - undefined, 1 - alive, 2+ suspected
          user.connectionState++;
          updateLobbiesForUser(user);
          connectedUsers.set(user.id, user);
        }
      } finally {
        release();
      }
    }

    f();

  });
}, 10 * second);

// cleaning();
