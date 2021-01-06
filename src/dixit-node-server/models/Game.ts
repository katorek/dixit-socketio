import {User} from './User';
import {Lobby} from './Lobby';
import {SettingsForm} from './settingsForm';
import {processImages} from '../services/process_images';
import {Votings} from './Votings';
import {Mutex} from 'async-mutex';

export enum GameState {
  PLAYING, ENDING, NO_MORE_CARDS, NEW_ROUND
}

export class Game {


  constructor(name: string, usersIds: string[], imgsPaths: string[]) {
    this.users = [];
    this.name = name;
    this.usersIds = usersIds;
    this.imgsPaths = imgsPaths;
    this.numOfUsers = usersIds.length;
    this.state = GameState.PLAYING;
    this.storyTellerId = 0;
    this.userStoryTeller = this.storyTeller;
    this.voteUserCardPointsVotedon = [];
    this.votings = [];
    console.log('Game-constructor', name, usersIds, this.userStoryTeller);
  }

  get nextImage() {
    if (this.imgsPaths?.length < 1) {
      return null;
    } else {
      return this.imgsPaths.pop();
    }
  }

  get storyTeller() {
    return this.usersIds[this.storyTellerId];
  }

  declare name: string;

  declare usersIds: string[];
  declare users: User[];
  declare mutex?: Mutex;
  declare imgsPaths: string[];
  declare votings: Votings[];
  declare voteUserCardPointsVotedon: [string, string, number, number][];
  declare numOfUsers: number;
  declare state: GameState;
  private declare storyTellerId: number;
  declare userStoryTeller: string;
  declare sentence: string;

  static newGame(lobby: Lobby, settings?: SettingsForm): Game {
    return new Game(
      lobby.name,
      lobby.usersIds.sort(() => Math.random() - 0.5),
      processImages(settings)
    );
  }

  // declare votePoints: number[];
  nextStoryTeller() {
    this.storyTellerId = (this.storyTellerId + 1) % this.numOfUsers;
    this.userStoryTeller = this.storyTeller;
    // return this.userStoryTeller;
  }

  private getXCards(numOfCards: number): string[] {
    const cards: string[] = [];
    for (let i = 0; i < numOfCards && this.imgsPaths; i++) {
      const card = this.imgsPaths.pop();
      if (card) {
        cards.push(card);
      }
    }
    return cards;
  }

  assignInitialCards() {
    if (this.numOfUsers === 3) { // 7 cards
      for (let i = 0; i < 3; i++) {
        if (this.users) {
          this.users[i].cards = this.getXCards(7);
        }
      }
    } else { // 6 cards
      for (let i = 0; i < this.numOfUsers; i++) {
        if (this.users) {
          this.users[i].cards = this.getXCards(6);
        }
      }
    }
    console.log('assignInitialCards', this.users);
  }


  dto() {
    return {
      name: this.name,
      users: this.users,
      state: this.state,
      sentence: this.sentence,
      userStoryTeller: this.userStoryTeller
    };
  }
}
