import {Component, isDevMode, OnInit} from '@angular/core';
import {SocketIOService} from './services/socketIO.service';
import {Topic} from '../dixit-node-server/models/Topic';
import {SessionService} from './services/session.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'dixit-socketio';

  constructor(private socketIO: SocketIOService,
              private sessionService: SessionService
  ) {
  }

  get isDevelopmentMode() {
    return isDevMode();
  }

  ngOnInit() {
    this.socketIO.init();
  }

  resetBackend() {
    this.socketIO.sendMessage(Topic.DEBUG_DATA_RESET);
  }

  showStorage() {
    this.sessionService.addCard('asd' + Math.floor(Math.random() * 100) + 1);
    this.socketIO.showStorage();
  }

  printUsers() {
    this.socketIO.sendMessage(Topic.DEBUG_PRINT_USERS);
  }

  printLobbies() {
    this.socketIO.sendMessage(Topic.DEBUG_PRINT_LOBBIES);
  }

  reloadClients() {
    this.socketIO.sendMessage(Topic.DEBUG_RELOAD);
  }

  printGames() {
    this.socketIO.sendMessage(Topic.DEBUG_PRINT_GAMES);

  }
}
