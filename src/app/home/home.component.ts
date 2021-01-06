import {Component, isDevMode, OnInit} from '@angular/core';
import {LobbyService} from '../services/lobby.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {HomeService} from '../services/home.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  declare lobbyForm: FormGroup;
  declare usernameForm: FormGroup;

  constructor(private lobbyService: LobbyService,
              private homeService: HomeService,
              private formBuilder: FormBuilder
  ) {
  }

  ngOnInit() {
    this.homeService.init();
    this.usernameForm = this.formBuilder.group({
      username: [null, [Validators.required, Validators.minLength(3)]]
    });
    this.lobbyForm = this.formBuilder.group({
      lobbyName: [null, [Validators.required]]
    });

    if (isDevMode()) {
      this.usernameForm.get('username')?.setValue('kator-' + Math.floor((Math.random() * 100) + 1));
      this.lobbyForm.get('lobbyName')?.setValue('dixit-' + Math.floor((Math.random() * 100) + 1));
    }
    if (this.lobbyService.username) {
      this.usernameForm.get('username')?.setValue(this.lobbyService.username);
    }
  }

  get games(): string[] {
    return this.homeService.games;
  }

  get lobbies(): string[] {
    return this.homeService.lobbies;
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
    this.homeService.joinLobby(lobbyName, this.username);
  }

  createLobby() {
    if (!this.lobbyForm.valid) {
      return;
    }
    this.homeService.createLobby(this.lobbyName, this.username);
  }

}

