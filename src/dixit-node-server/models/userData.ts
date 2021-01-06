import {UserAction} from './UserAction';

export class UserData {
  type: UserAction;
  name?: string;
  cards?: string[];

  constructor(type: UserAction, name?: string) {
    this.type = type;
    if (name) {
      this.name = name;
    }
  }

  static withCards(cards: string[]): UserData {
    return {
      type: UserAction.SET_CARDS,
      cards
    };
  }

}
