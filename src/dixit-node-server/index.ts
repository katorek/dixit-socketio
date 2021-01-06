import express from 'express';
import {Topic} from './models/Topic';
import {Socket} from 'socket.io';
import {Lobby} from './models/Lobby';
import {LobbyRequest} from './models/requests/lobbyRequest';
import {ErrorType} from './models/ErrorType';
import {UserAction} from './models/UserAction';
import {User} from './models/User';
import {UserData} from './models/userData';
import {Game} from './models/Game';
import {GameRequest} from './models/requests/GameRequest';
import {createLobby, joinLobby, sendActiveRooms, sendLobbyInfo} from './services/lobby_service';
import {newRound, sendGameInfo, startGame, updateCard, updateSentence, voteOnCard} from './services/game_service';
import {updateUser, userDisconnected} from './services/user_service';
import {SentenceOrCardRequest} from './models/requests/SentenceOrCardRequest';


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
const games = new Map<string, Game>();
const connectedUsers = new Map<string, User>();

export const getLobbies = () => {
  return lobbies;
};
export const setLobby = (lobby: Lobby) => {
  lobbies.set(lobby.name, lobby);
};

export const getGames = () => {
  return games;
};
export const setGame = (game: Game) => {
  games.set(game.name, game);
};

export const getUsers = () => {
  return connectedUsers;
};
export const getUser = (id: string) => {
  return connectedUsers.get(id);
};
export const setUser = (id: string, user: User) => {
  connectedUsers.set(id, user);
};


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

  socket.on(Topic.UPDATE_USER, async (user: User) => {
    updateUser(user, socket.id);
  });

  // development helpers, todo to be removed
  socket.on(Topic.DEBUG_DATA_RESET, () => {
    developmentSetUp();
  });

  socket.on(Topic.DEBUG_PRINT_USERS, () => {
    console.log('users: ', connectedUsers);
  });

  socket.on(Topic.DEBUG_PRINT_LOBBIES, () => {
    lobbies.forEach(l => console.log('lobby: ', l.name, l.usersIds));
  });

  socket.on(Topic.DEBUG_PRINT_GAMES, () => {
    games.forEach(game => {
      console.log('game: ', game.name, game.usersIds, 'imgsPaths.length', game.imgsPaths.length, game.sentence,
        game.users?.map(u => u.selectedCard?.substring(u.selectedCard?.lastIndexOf('/') + 1)).toString());
      console.log('game v2', game);
    });
  });

  socket.on(Topic.DEBUG_RELOAD, () => {
    const usersIds = Array.from(connectedUsers.keys());
    developmentSetUp();
    for (const userId of usersIds) {
      sendMessage(userId, new UserData(UserAction.RELOAD_PAGE));
    }
  });
  // end debug


  socket.on(Topic.GET_LOBBIES, () => {
    sendActiveRooms();
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

  socket.on(Topic.START_GAME, (gameData: GameRequest) => {
    startGame(gameData);
  });

  socket.on(Topic.GAME_INFO, (gameData: GameRequest) => {
    sendGameInfo(gameData);
  });

  socket.on(Topic.SENTENCE_UPDATE, (request: SentenceOrCardRequest) => {
    updateSentence(request);
  });

  socket.on(Topic.CARD_SELECTED, (request: SentenceOrCardRequest) => {
    updateCard(request, false);
  });

  socket.on(Topic.CARD_VOTE, (request: SentenceOrCardRequest) => {
    voteOnCard(request);
  });

  socket.on(Topic.NEW_ROUND, (request: SentenceOrCardRequest) => {
    newRound(request);
  });


  socket.on('disconnect', async () => {
    userDisconnected(socket.id);
  });

});

export const sendMessage = (topic: string, data: any) => {
  if (development) {
    if (topic.includes('vote-')) {
      console.log('Sending on [' + topic + '], data:', data);
    }
  }
  io.emit(topic, data);
};

export function err(msg: string, title: string, error: ErrorType): Err {
  return new Err(msg, title, error);
}

export class Err {
  declare msg: string;
  declare title: string;
  declare error: ErrorType;

  constructor(msg: string, title: string, error: ErrorType) {
    this.msg = msg;
    this.title = title;
    this.error = error;
  }
}

export function sendErrorToUser(userId: string, errorData: Err) {
  io.emit('error-' + userId, errorData);
}

const developmentSetUp = () => {
  // const user: User = new User('host_id', 'host');
  connectedUsers.clear();
  // connectedUsers.set('host_id', user);
  lobbies.clear();
  // lobbies.set('test1', {
  //   name: 'name',
  //   hostId: 'host_id',
  //   usersIds: [user.id]
  // });
  games.clear();
  sendActiveRooms();
};

if (development) {
  developmentSetUp();

}

http.listen(3000, () => {
  console.log('listening on *:3000');
});
