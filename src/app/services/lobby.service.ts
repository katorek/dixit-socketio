import {Injectable} from '@angular/core';
import {Topic} from '../../dixit-node-server/models/Topic';
import {SocketIOService} from './socketIO.service';
import {Lobby} from '../../dixit-node-server/models/Lobby';
import {User} from '../../dixit-node-server/models/User';
import {UsernameDialogComponent} from '../dialogs/username/username-dialog.component';
import {MatDialog} from '@angular/material/dialog';

@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  lobbies: string[] = [];
  lobbyUsers: User[] = [];
  declare lobby: Lobby;


  constructor(private socket: SocketIOService,
              public usernameDialog: MatDialog
  ) {
    this.socket.subscribeTopic(Topic.LIST_LOBBIES)
      .subscribe((data: ActiveRooms) => this.lobbies = data.lobbies || []);
    this.refreshLobbies();
  }

  subscribeLobby(lobbyId: string) {
    this.socket.subscribeString('lobby-' + lobbyId).subscribe((data: Lobby) => {
      console.log('subscribeLobby', data);
      this.lobby = data;
      if (data.users) {
        this.lobbyUsers = data?.users;
      }
    });
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

  getLobbyInfo(lobbyName: string) {
    this.socket.sendMessage(Topic.LOBBY_INFO, {lobbyName});
  }

  get amHost(): boolean {
    return this.lobby.hostId === this.socket.state.id;
  }

  get username() {
    return this.socket.state?.username;
  }

  ensureUsernameIsPresent(lobbyName: string) {
    const username = this.socket.state?.username;
    console.log('username', username);
    if (username === undefined) {
      console.log('showing modal');
      // const dialogRef = this.usernameDialog.

      const dialogRef = this.usernameDialog.open(UsernameDialogComponent, {
        width: '250px',
        disableClose: true,
        closeOnNavigation: true,
        data: {username}
      });

      dialogRef.afterClosed().subscribe(result => {
        this.socket.sendMessage(Topic.UPDATE_USER, {username: result});
        this.joinLobby(lobbyName, result);
        this.getLobbyInfo(lobbyName);
      });

    }
  }
}

interface ActiveRooms {
  lobbies?: string[];
  games?: string[];
}
