import {User} from './User';

export enum LobbyStatus {
  WAITING,
  STARTED
}

export class Lobby {
  declare name: string;
  declare hostId: string;
  declare usersIds: string[];
  declare users?: User[];
  declare mutex?: any;
}
