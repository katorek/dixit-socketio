import {Injectable} from '@angular/core';
import {Topic} from '../../dixit-node-server/models/Topic';
import {SocketIOService} from './socketIO.service';
import {Lobby} from '../../dixit-node-server/models/Lobby';
import {User} from '../../dixit-node-server/models/User';
import {UsernameDialogComponent} from '../dialogs/username/username-dialog.component';
import {MatDialog} from '@angular/material/dialog';
import {GameRequest} from '../../dixit-node-server/models/requests/GameRequest';
import {HomeService} from './home.service';
import {SettingsForm} from '../../dixit-node-server/models/settingsForm';
import { Clipboard } from '@angular/cdk/clipboard';


@Injectable({
  providedIn: 'root'
})
export class LobbyService {
  lobbyUsers: User[] = [];
  declare lobby: Lobby;


  constructor(private socket: SocketIOService,
              private homeService: HomeService,
              private clipboard: Clipboard,
              public usernameDialog: MatDialog) {
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


  getLobbyInfo(lobbyName: string) {
    this.socket.sendMessage(Topic.LOBBY_INFO, {lobbyName});
  }

  get amHost(): boolean {
    return this.lobby?.hostId === this.socket.state.id;
  }

  get username() {
    return this.socket.state?.username;
  }

  ensureUsernameIsPresent(lobbyName: string) {
    const username = this.socket.state?.username;
    if (username === undefined) {
      const dialogRef = this.usernameDialog.open(UsernameDialogComponent, {
        width: '250px',
        disableClose: true,
        closeOnNavigation: true,
        data: {username}
      });

      dialogRef.afterClosed().subscribe(result => {
        this.socket.sendMessage(Topic.UPDATE_USER, {username: result});
        this.homeService.joinLobby(lobbyName, result);
        this.getLobbyInfo(lobbyName);
      });
    }
  }

  joinLobby(lobbyName: string, username?: string) {
    this.homeService.joinLobby(lobbyName, username);
  }

  startGame(settings: SettingsForm) {
    console.log('start game', settings);
    this.socket.sendMessage(Topic.START_GAME, new GameRequest(this.lobby.name, settings));
  }

  copyLink() {
    this.clipboard.copy(window.location.href);
    this.socket.toast.info('Success', 'Link copied');
  }
}

