import {User} from '../models/User';
import {Mutex} from 'async-mutex';
import {ConnectionState} from '../models/connection-state';
import {removeUserFromLobby, sendLobbyInfo, updateLobbiesForUser} from './lobby_service';
import {getUser, getUsers, setUser} from '../index';

export function updateUser(user: User, socketId: string) {
  if (!user.mutex) {
    user.mutex = new Mutex();
  }

  user.mutex
    .acquire()
    .then(release => {
      user.wsId = socketId;
      user.connectionState = ConnectionState.ALIVE;

      setUser(user.id, user);
      if (user.lobbyName) {
        updateLobbiesForUser(user);
        sendLobbyInfo(user.lobbyName);
      }
      release();
    });
}

export function mapUsers(userIds?: string[]): User[] {
  if (userIds) {
    // @ts-ignore
    return userIds.map(id => getUser(id));
  }
  return [];
}

export function updateConnectedUser(user: User) {
  setUser(user.id, user);
}

export const userDisconnected = (socketId: string) => {
  const user = getUserBySocketId(socketId);
  if (!user) {
    return;
  } else {
    user.connectionState = ConnectionState.SUSPECTED_LOST;
    setUser(user.id, user);
    console.log('User disconnected', user.id);
    sendLobbyInfo(user.lobbyName);
  }
  const userId = user.id;
  const userClean = setInterval(() => {
    // console.log('userDisconnected ', x++);
    const u = getUser(userId);
    if (!u) {
      clearInterval(userClean);
      return;
    }
    if (!u.mutex) {
      u.mutex = new Mutex();
    }
    u.mutex
      .acquire()
      .then(release => {
        // console.log('user.mutex user.state:', u.connectionState);
        if (u.connectionState === ConnectionState.ALIVE) {
          clearInterval(userClean);
        } else if (u.connectionState > 1) {
          u.connectionState++;
          updateLobbiesForUser(u);
          if (u.connectionState > ConnectionState.LOST) {
            console.log('removing user', u.id, ' from lobbies etc.');
            u.connectionState = ConnectionState.UNDEFINED;
            removeUserFromLobby(u);
            clearInterval(userClean);
          }
          setUser(u.id, u);
        }
        release();
      });
  }, 2 * second);

};

function getUserBySocketId(wsId: string) {
  for (const user of getUsers().values()) {
    if (user.wsId === wsId) {
      return user;
    }
  }
}

const second = 1000;
