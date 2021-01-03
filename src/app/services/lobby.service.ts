import {Injectable} from '@angular/core';
import {Topic} from '../../dixit-node-server/models/Topic';
import {SocketIOService} from './socketIO.service';
import {Observable, Subject} from 'rxjs';
import {Lobby} from '../../dixit-node-server/models/Lobby';
import {User} from '../../dixit-node-server/models/User';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  lobbies: string[] = [];
  lobbyUsers: User[] = [];

  constructor(private socket: SocketIOService) {
    this.socket.subscribeTopic(Topic.LIST_LOBBIES)
      .subscribe((data: ActiveRooms) => this.lobbies = data.lobbies || []);
    this.refreshLobbies();
  }

  subscribeLobby(lobbyId: string) {
    this.socket.subscribeString('lobby-' + lobbyId).subscribe((data: Lobby) => {
      console.log('subscribeLobby', data);
      this.lobbyUsers = data.users;
    });
  }

  // get lobbyUsers() {
  //   return this.socket.;
  // }

  refreshLobbies() {
    this.socket.sendMessage(Topic.GET_LOBBIES);
  }

  createLobby(lobbyName: string, username: string) {
    this.socket.sendMessage(Topic.CREATE_LOBBY, {lobbyName, username});
  }

  joinLobby(lobbyName: string, username: string) {
    this.socket.sendMessage(Topic.JOIN_LOBBY, {lobbyName, username});
  }

  getLobbyInfo(lobbyName: string) {
    this.socket.sendMessage(Topic.LOBBY_INFO, {lobbyName});
  }
}

interface ActiveRooms {
  lobbies?: string[];
  games?: string[];
}
