import {Component, OnInit} from '@angular/core';
import {SocketIOService} from './services/socketIO.service';
import {Topic} from '../dixit-node-server/models/Topic';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'dixit-socketio';

  constructor(private socketIO: SocketIOService) {
  }

  ngOnInit() {
    this.socketIO.init();
  }

  resetBackend() {
    this.socketIO.sendMessage(Topic.DEBUG_DATA_RESET);
  }

  showStorage() {
    this.socketIO.showStorage();
  }

  printUsers() {
    this.socketIO.sendMessage(Topic.DEBUG_PRINT_USERS);
  }

  printLobbies() {
    this.socketIO.sendMessage(Topic.DEBUG_PRINT_LOBBIES);
  }
}
