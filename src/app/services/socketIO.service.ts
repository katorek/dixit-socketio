import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {io, Socket} from 'socket.io-client';
import {Observable} from 'rxjs';
import {Topic} from '../../dixit-node-server/models/Topic';
import {SessionService} from './session.service';
import {v4 as uuidv4} from 'uuid';
import {Router} from '@angular/router';
import * as _ from 'lodash';
import {ToastrService} from 'ngx-toastr';
import {Errors} from '../../dixit-node-server/models/Errors';
import {UserAction} from '../../dixit-node-server/models/UserAction';

@Injectable({
  providedIn: 'root'
})
export class SocketIOService {
  declare state: State;
  declare socket: Socket;

  constructor(private session: SessionService,
              private router: Router,
              private toastr: ToastrService) {

  }

  init(): void {
    this.state = this.session.get('state') || {id: uuidv4()};
    this.refreshState();
    console.log('SocketIOService init', this.state);
    this.socket = io(environment.socketEndpoint);
    this.sendMessage(Topic.UPDATE_USER, this.user);
    this.subscribeString(this.state.id).subscribe((data: UserData) => this.handleMessage(data));
    this.initErrorHandling();
  }

  get user() {
    return this.state;
  }

  initErrorHandling() {
    this.subscribeString('error-' + this.state.id)
      .subscribe((data) => this.handleError(data));
  }

  handleError(errorData: ErrorData) {
    console.log('Error', errorData);
    switch (errorData.error) {
      case Errors.LOBBY_ALREADY_EXISTS: {
        this.toastr.error(errorData.msg, errorData.title);
        break;
      }
    }
  }

  handleMessage(data: UserData) {
    switch (data.type) {
      case UserAction.JOIN_LOBBY: {
        this.router.navigateByUrl('/lobby/' + data.lobbyName);
        break;
      }
    }
  }

  updateState(obj: any) {
    let state = this.session.get('state');
    if (state instanceof String || state === '' || state === null) {
      state = obj;
    } else {
      state = _.assignIn(state, obj);
    }
    this.state = state;
    this.session.set('state', state);
  }

  refreshState() {
    this.updateState(this.state);
  }

  subscribeString(topic: string): Observable<any> {
    return new Observable((observer) => {
      this.socket.on(topic, (message: any) => {
        console.log('Received data: ', message);
        observer.next(message);
      });
    });
  }

  subscribeTopic(topic: Topic): Observable<any> {
    return this.subscribeString(topic);
  }

  sendMessage(topic: Topic, data?: any) {
    data = this.appendUUID(data);
    console.log('Sending to [' + topic + '], data: ', data);

    this.socket.emit(topic, data);
  }

  private appendUUID(data: any) {
    if (!data) {
      return {id: this.state.id};
    } else {
      return _.assignIn(data, {id: this.state.id});
    }
  }

  showStorage() {
    this.session.showStorage();
  }

  updateUsername(username: string) {
    this.updateState({username});
    this.sendMessage(Topic.UPDATE_USER, {username});
  }
}

export interface State {
  gameUuid?: string;
  id: string;
  username?: string;
  data?: any;
}

export interface ErrorData {
  error: Errors;
  msg: string;
  title: string;
  data: any;
}

export interface UserData {
  type: UserAction;
  lobbyName?: string;
  data?: any;
}
