import {Component, OnInit} from '@angular/core';
import {SocketIOService} from './services/socketIO.service';

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
}
