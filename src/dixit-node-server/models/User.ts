import {ConnectionState} from './connection-state';
import Mutex from 'async-mutex/lib/Mutex';

export class User {
  declare id: string;
  declare username: string;
  declare wsId?: string;
  declare lobbyName?: string;
  declare gameId?: string;
  declare mutex?: Mutex;
  declare cards?: string[];
  declare points?: number;
  declare selectedCard?: string;
  connectionState: ConnectionState = ConnectionState.UNDEFINED;

  constructor(id: string, username: string) {
    this.id = id;
    this.username = username;
  }
}
