import {Component, isDevMode, OnInit} from '@angular/core';
import {SocketIOService} from '../services/socketIO.service';
import {Topic} from '../../dixit-node-server/models/Topic';
import {LobbyService} from '../services/lobby.service';
import {FormBuilder, FormControl, FormControlName, FormGroup, Validators} from '@angular/forms';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  declare lobbyForm: FormGroup;
  declare usernameForm: FormGroup;

  constructor(private lobbyService: LobbyService,
              private formBuilder: FormBuilder
  ) {
  }

  ngOnInit() {
    this.usernameForm = this.formBuilder.group({
      username: [null, [Validators.required, Validators.minLength(3)]]
    });
    this.lobbyForm = this.formBuilder.group({
      lobbyName: [null, [Validators.required]]
    });

    if (isDevMode()) {
      this.usernameForm.get('username')?.setValue('kator-' + Math.floor((Math.random() * 100) + 1));
      this.lobbyForm.get('lobbyName')?.setValue('lobby-name-' + Math.floor((Math.random() * 100) + 1));
    }
    if (this.lobbyService.username) {
      this.usernameForm.get('username')?.setValue(this.lobbyService.username);
    }
  }

  get lobbies(): string[] {
    return this.lobbyService.lobbies;
  }

  get lobbyName(): string {
    return this.lobbyForm.get('lobbyName')?.value;
  }

  get username(): string {
    return this.usernameForm.get('username')?.value;
  }

  joinLobby(lobbyName: string) {
    if (!this.usernameForm.valid) {
      return;
    }
    this.lobbyService.joinLobby(lobbyName, this.username);
  }

  createLobby() {
    if (!this.lobbyForm.valid) {
      return;
    }
    this.lobbyService.createLobby(this.lobbyName, this.username);
  }

}

