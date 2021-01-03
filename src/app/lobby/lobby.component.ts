import {Component, OnInit} from '@angular/core';
import {LobbyService} from '../services/lobby.service';
import {ActivatedRoute} from '@angular/router';
import {SessionService} from '../services/session.service';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  declare lobbyName: string;

  constructor(private lobbyService: LobbyService,
              private sessionService: SessionService,
              private route: ActivatedRoute) {
  }

  get amHost(): boolean {
    return this.lobbyService.amHost;
  }

  get users() {
    return this.lobbyService.lobbyUsers;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => this.lobbyName = params.lobbyName);
    this.lobbyService.ensureUsernameIsPresent(this.lobbyName);
    this.lobbyService.subscribeLobby(this.lobbyName);
    this.lobbyService.joinLobby(this.lobbyName);
    this.lobbyService.getLobbyInfo(this.lobbyName);
  }

}
