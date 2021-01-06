import {ConnectionState} from '../models/connection-state';
import {getGames, getUser, removeGame, setUser, TIME_FORMAT} from '../index';
import {removeUserFromLobby, sendLobbyInfo, updateLobbiesForUser} from './lobby_service';
import {Mutex} from 'async-mutex';
import {getUserBySocketId} from './user_service';
import moment from 'moment';

const second = 1000;
const minute = 60 * second;

export const userDisconnect = (socketId: string) => {
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
  }, 10 * second);

};

const cleanOldGamesAndLobbies = setInterval(() => {
  const now = moment().format(TIME_FORMAT);

  getGames().forEach(game => {
    const notUpdatedSinceXMinutes = (moment.duration(moment(now, TIME_FORMAT).diff(moment(game.lastUpdated, TIME_FORMAT)))).asMinutes();
    console.log('game', game.name, 'not updated since', notUpdatedSinceXMinutes, 'minutes');
    if (notUpdatedSinceXMinutes > 15) {
      removeGame(game.name);
    }
  });
}, 10 * minute);
