import {Injectable} from '@angular/core';
import {SocketIOService} from './socketIO.service';
import {Topic} from '../../dixit-node-server/models/Topic';

interface ActiveRooms {
  lobbies?: string[];
  games?: string[];
}


@Injectable({
  providedIn: 'root'
})
export class HomeService {
  lobbies: string[] = [];
  games: string[] = [];

  constructor(private socket: SocketIOService) {

  }

  init() {
    this.socket.subscribeTopic(Topic.LIST_LOBBIES_AND_GAMES)
      .subscribe((data: ActiveRooms) => {
        console.log('ActiveRooms', data);
        this.games = data.games || [];
        this.lobbies = data.lobbies || [];
      });
    this.refreshLobbies();
  }

  refreshLobbies() {
    this.socket.sendMessage(Topic.GET_LOBBIES);
  }


  createLobby(lobbyName: string, username: string) {
    this.socket.updateUsername(username);
    this.socket.sendMessage(Topic.CREATE_LOBBY, {lobbyName, username});
  }

  joinLobby(lobbyName: string, username?: string) {
    if (username) {
      this.socket.updateUsername(username);
    }
    this.socket.sendMessage(Topic.JOIN_LOBBY, {lobbyName});
  }

}

