import {ConnectionState} from './connection-state';

export class User {
  declare id: string;
  declare username: string;
  declare wsId?: string;
  declare lobbyName?: string;
  declare gameId?: string;
  declare mutex?: any;
  connectionState: ConnectionState = ConnectionState.UNDEFINED;

  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
  }
}
