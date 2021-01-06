import {Injectable} from '@angular/core';
import {SocketIOService} from './socketIO.service';
import {Game, GameState} from '../../dixit-node-server/models/Game';
import {GameRequest} from '../../dixit-node-server/models/requests/GameRequest';
import {Topic} from '../../dixit-node-server/models/Topic';
import {UserData} from '../../dixit-node-server/models/userData';
import {SentenceOrCardRequest} from '../../dixit-node-server/models/requests/SentenceOrCardRequest';
import {CardRequest} from '../../dixit-node-server/models/requests/CardRequest';
import {Votings} from '../../dixit-node-server/models/Votings';
import {NewRoundRequest} from '../../dixit-node-server/models/requests/NewRoundRequest';

@Injectable({
  providedIn: 'root'
})
export class GameService {
  declare currentGame: Game;
  declare cards: string[];
  declare voteCards: Votings[];
  everyoneVoted = false;
  voteCardsShown = false;
  selectedIdx = -1;


  get amStoryTeller() {
    // console.log('amStoryTeller', this.socket.userId, this.currentGame?.storyTeller);
    return this.socket.userId === this.currentGame?.userStoryTeller;
  }

  get alreadySendCard() {
    return this.currentGame?.users.filter(u => u.id === this.socket.userId).map(u => u.selectedCard)[0] !== undefined;
  }

  constructor(private socket: SocketIOService) {
  }

  private isUserInGame(game: Game, userId: string) {
    return game.users?.findIndex(u => u.id === userId) !== -1;
  }

  subscribeGame(gameName: string) {
    this.socket.subscribeString('cards-' + this.socket.userId)
      .subscribe((cardsData: UserData) => {
        if (cardsData.cards) {
          this.cards = cardsData.cards;
        }
      });
    this.socket.subscribeString('game-' + gameName)
      .subscribe((data: Game) => {
        if (data.state === GameState.NEW_ROUND) {
          this.cleanUpOldRound();
        }

        console.log('subscribeGame', data, this.isUserInGame(data, this.socket.userId));
        if (this.isUserInGame(data, this.socket.userId)) {
          this.currentGame = data;
        }
      });
    this.socket.subscribeString('vote-' + this.socket.userId)
      .subscribe((votings: [string, string, number, number][]) => {
        const cards = Votings.fromArr(votings);
        if(cards){
          this.voteCards = cards;
        }

        if (this.everyoneVotedExceptStoryTeller(cards)) {
          this.voteCards = cards;

          for (const v of this.voteCards) {
            v.usernamesThatVotedOn = [];
            v.username = this.currentGame.users.find(u => u.id === v.userId)?.username || '';
          }
          for (const v of this.voteCards) {
            this.voteCards[v.votedOnIdx]?.usernamesThatVotedOn?.push(v.username || '');
          }
          this.everyoneVoted = true;
          console.log('--------------------------------');
          console.log('    MAMMA   MIA');
          console.log('--------------------------------');
        }
        // console.log('================================');
        // console.log(this.voteCards);
        // console.log('================================');
      });
  }

  cleanUpOldRound() {
    this.voteCards = [];
    this.everyoneVoted = false;
    this.voteCardsShown = false;
  }

  everyoneVotedExceptStoryTeller(votings: Votings[]) {
    return votings
      .filter(v => v.userId !== this.currentGame.userStoryTeller)
      .filter(v => v.votedOnIdx === -1)
      .length === 0;
  }

  getGameInfo(gameName: string) {
    this.socket.sendMessage(Topic.GAME_INFO, new GameRequest(gameName));
  }

  sendSelection(cardPath: string, sentenceForm?: SentenceFormValue) {
    this.cards.splice(this.cards.findIndex(c => c === cardPath), 1);
    if (sentenceForm && this.amStoryTeller) {
      this.socket.sendMessage(Topic.SENTENCE_UPDATE, new SentenceOrCardRequest(sentenceForm.sentence, cardPath, this.currentGame.name));
    } else {
      this.socket.sendMessage(Topic.CARD_SELECTED, new CardRequest(cardPath, this.currentGame.name));
    }
  }

  voteForCard(cardPath: string) {
    this.socket.sendMessage(Topic.CARD_VOTE, new CardRequest(cardPath, this.currentGame.name));
  }

  requestNewRound() {
    this.socket.sendMessage(Topic.NEW_ROUND, new NewRoundRequest(this.currentGame.name));
  }
}

interface SentenceFormValue {
  sentence: string;
}
