import {Component, OnInit} from '@angular/core';
import {LobbyService} from '../services/lobby.service';
import {ActivatedRoute} from '@angular/router';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  declare lobbyName: string;

  constructor(private lobby: LobbyService,
              private route: ActivatedRoute) {
  }


  get users() {
    return this.lobby.lobbyUsers;
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => this.lobbyName = params.lobbyName);
    this.lobby.subscribeLobby(this.lobbyName);
    this.lobby.getLobbyInfo(this.lobbyName);
  }

}
