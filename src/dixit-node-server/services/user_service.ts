import {User} from '../models/User';
import {Mutex} from 'async-mutex';
import {ConnectionState} from '../models/connection-state';
import {sendLobbyInfo, updateLobbiesForUser} from './lobby_service';
import {getUser, getUsers, setUser} from '../index';

export const updateUser = (user: User, socketId: string) => {
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
};

export const mapUsers = (userIds?: string[]): User[] => {
  if (userIds) {
    // @ts-ignore
    return userIds.map(id => getUser(id));
  }
  return [];
};

export const updateConnectedUser = (user: User) => {
  setUser(user.id, user);
};

export const getUserBySocketId = (wsId: string) => {
  for (const user of getUsers().values()) {
    if (user.wsId === wsId) {
      return user;
    }
  }
};
