import {User} from './User';

export class Lobby {
  declare name: string;
  declare hostId: string;
  declare usersIds: string[];
  declare users?: User[];
}
