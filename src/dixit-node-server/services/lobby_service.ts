import {LobbyRequest} from '../models/requests/lobbyRequest';
import {Lobby} from '../models/Lobby';
import {Topic} from '../models/Topic';
import {err, getGames, getLobbies, getUser, sendErrorToUser, sendMessage, setLobby} from '../index';
import {ErrorType} from '../models/ErrorType';
import {UserData} from '../models/userData';
import {UserAction} from '../models/UserAction';
import {User} from '../models/User';
import {mapUsers, updateConnectedUser} from './user_service';
// import {mapUsers, updateConnectedUser} from './user_service';


export const sendActiveRooms = () => {
  const data = {
    lobbies: Array.from(getLobbies().keys()),
    games: Array.from(getGames().keys())
  };
  sendMessage(Topic.LIST_LOBBIES_AND_GAMES, data);
};

export function newLobby(lobbyRequest: LobbyRequest): Lobby {
  return {
    name: lobbyRequest.lobbyName,
    hostId: lobbyRequest.id,
    usersIds: []
  };

}

export function createLobby(data: LobbyRequest) {
  if (getLobbies().has(data.lobbyName)) {
    console.log('Lobby ' + data.lobbyName + ' already exists !');
    sendErrorToUser(data.id, err('Lobby ' + data.lobbyName + ' already exists !', 'Error', ErrorType.LOBBY_ALREADY_EXISTS));
  } else {
    getLobbies().set(data.lobbyName, newLobby(data));
    joinLobby(data);
  }
  sendActiveRooms();
}

export function joinLobby(data: LobbyRequest) {
  if (!getLobbies().get(data.lobbyName)) {
    getLobbies().set(data.lobbyName, newLobby(data));
    sendActiveRooms();
  }
  addUserToLobby(data);
  sendMessage(data.id, new UserData(UserAction.JOIN_LOBBY, data.lobbyName));
}


export function updateLobbiesForUser(user: User) {
  getLobbies().forEach(l => {
    const idx = l.usersIds.findIndex(u => u === user.id);
    if (idx !== -1) {
      l.usersIds[idx] = user.id;
    }
  });
}

export function sendLobbyInfo(lobbyName?: string) {
  if (lobbyName && getLobbies().get(lobbyName)) {
    const lobby = getLobbies().get(lobbyName);
    if (lobby !== undefined) {
      lobby.users = mapLobbyUsers(lobbyName);
      console.log('lobby', lobby);
    }
    sendMessage('lobby-' + lobbyName, lobby);
  }
}


export function removeUserFromLobby(user: User) {
  getLobbies().forEach(l => {
    const idx = l.usersIds.findIndex(u => u === user.id);
    if (idx !== -1) {
      l.usersIds.splice(idx, 1);
      user.lobbyName = undefined;
      if (user.id === l.hostId) {
        if (l.usersIds.length > 0) {
          l.hostId = l.usersIds[0];
          // updateLobbies(l.name, l);
          setLobby(l);
        } else {
          getLobbies().delete(l.name);
          sendActiveRooms();
        }
      }
    }
    sendLobbyInfo(l.name);
  });
}

function addUserToLobby(data: LobbyRequest) {
  if (!getLobbies().has(data.lobbyName)) {
    sendErrorToUser(data.id, err('Lobby not found', 'Error', ErrorType.LOBBY_NOT_FOUND));
  } else {
    const user = getUser(data.id);
    if (user) {
      user.lobbyName = data.lobbyName;
      updateConnectedUser(user);
      const idx = getLobbies().get(data.lobbyName)?.usersIds.findIndex(u => u === user.id);
      if (idx === -1) {
        getLobbies().get(data.lobbyName)?.usersIds.push(user.id);
      }
    }
  }
}

function mapLobbyUsers(lobbyName: string): User[] {
  return mapUsers(getLobbies().get(lobbyName)?.usersIds);
}

