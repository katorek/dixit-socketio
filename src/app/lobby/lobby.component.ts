import {Component, OnInit} from '@angular/core';
import {LobbyService} from '../services/lobby.service';
import {ActivatedRoute} from '@angular/router';
import {SessionService} from '../services/session.service';
import {FormBuilder, FormGroup} from '@angular/forms';
import {LobbyValidator} from './lobby-validator';
import {SettingsForm} from '../../dixit-node-server/models/settingsForm';

@Component({
  selector: 'app-lobby',
  templateUrl: './lobby.component.html',
  styleUrls: ['./lobby.component.scss']
})
export class LobbyComponent implements OnInit {
  declare lobbyName: string;
  declare settingsForm: FormGroup;
  defaultImages = false;


  constructor(private lobbyService: LobbyService,
              private sessionService: SessionService,
              private fb: FormBuilder,
              private route: ActivatedRoute) {
  }

  get amHost(): boolean {
    return this.lobbyService.amHost;
  }

  get users() {
    return this.lobbyService.lobbyUsers;
  }

  copyLink() {
    this.lobbyService.copyLink();
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => this.lobbyName = params.lobbyName);
    this.lobbyService.ensureUsernameIsPresent(this.lobbyName);
    this.lobbyService.subscribeLobby(this.lobbyName);
    this.lobbyService.joinLobby(this.lobbyName);
    this.lobbyService.getLobbyInfo(this.lobbyName);

    this.settingsForm = this.fb.group({
      hidden: [],
      defaultImages: [''],
      imagesLink: [null, [LobbyValidator.validateLink/*Validators.required*/]]
    });

    this.slider?.valueChanges
      .subscribe(value => {
        console.log('valueChanged', value);
        if (value) {
          this.link?.disable();
          this.link?.setValue('Default images');
        } else {
          this.link?.enable();
          this.link?.setValue('');
        }
      });

    // todo add processing file or uplaoding file or whatever
    this.slider?.setValue(true);
    this.slider?.disable();
  }

  private get slider() {
    return this.settingsForm.controls.defaultImages;
  }

  private get link() {
    return this.settingsForm.controls.imagesLink;
  }

  startGame() {
    if (this.slider.disabled) {
      this.lobbyService.startGame({defaultImages: true});
    } else {
      this.lobbyService.startGame(this.settingsForm.value as SettingsForm);
    }
  }

  printInfo() {
    console.log(this.settingsForm);
  }
}

