import {GameRequest} from '../models/requests/GameRequest';
import {UserData} from '../models/userData';
import {Game, GameState} from '../models/Game';
import {Mutex} from 'async-mutex';
import {UserAction} from '../models/UserAction';
import {sendActiveRooms} from './lobby_service';
import {err, getGames, getLobbies, sendErrorToUser, sendMessage, setGame} from '../index';
import {mapUsers} from './user_service';
import {SentenceOrCardRequest} from '../models/requests/SentenceOrCardRequest';
import {ErrorType} from '../models/ErrorType';
import {NewRoundRequest} from '../models/requests/NewRoundRequest';

export const startGame = (gameData: GameRequest) => {
  const lobbyName = gameData.name;

  const lobby = getLobbies().get(lobbyName);
  if (lobby) {
    const game = Game.newGame(lobby, gameData.settings);
    game.users = mapUsers(game.usersIds);
    game.assignInitialCards();
    game.mutex = new Mutex();
    setGame(game);


    lobby.usersIds.forEach(userId => {
      sendMessage(userId, new UserData(UserAction.JOIN_GAME, game.name));
    });
    getLobbies().delete(lobbyName);
    sendActiveRooms();
  }

};

const checkGame = (game: Game) => {
  if (hasEveryoneSendCard(game)) {
    if (!game.voteUserCardPointsVotedon || game.voteUserCardPointsVotedon.length < 1) {

      game.voteUserCardPointsVotedon = getSelectedCards(game);
    }
    game.usersIds.forEach(userId => {
      sendMessage('vote-' + userId, game.voteUserCardPointsVotedon);
    });
  }
};

export const sendGameInfo = (request: GameRequest) => {
  const game = getGames().get(request.name);
  if (game) {
    sendGameStatus(game);
    sendCardsToUser(game, request.id);
    checkGame(game);
  }
};

const sendCardsToUser = (game: Game, userId: string) => {
  if (isUserInGame(game, userId)) {
    const idx =
      sendMessage('cards-' + userId, UserData.withCards(getUserCards(game, userId)));
  }
};

export const updateSentence = (request: SentenceOrCardRequest) => {
  console.log('updateSentence ', request.sentence);
  updateCard(request, true);
};

export const updateCard = (request: SentenceOrCardRequest, shuldUpdateSentence: boolean) => {
  const game = getGames().get(request.gameName);
  if (game) {
    game.mutex
      ?.acquire()
      .then(release => {
        if (shuldUpdateSentence) {
          game.sentence = request.sentence;
        }
        const userIdx = game.users?.findIndex(u => u.id === request.id);
        if (game.users[userIdx]) {
          game.users[userIdx].selectedCard = request.cardPath;
          const cards = game.users[userIdx].cards;
          if (cards) {
            cards.splice(cards.findIndex(c => c === request.cardPath), 1);
            const newCard = game.nextImage;
            if (newCard) {
              cards.push(newCard);
            } else {
              game.state = GameState.NO_MORE_CARDS;
            }
            game.users[userIdx].cards = cards;
          }
        }
        console.log('game.sentence', game.sentence);
        sendGameStatus(game);
        checkGame(game);
        sendCardsToUser(game, request.id);
        setGame(game);
        release();
      });
  }
};

const hasUserNotVotedYet = (game: Game, userId: string) => {
  const u = game.voteUserCardPointsVotedon.find(_ => _[0] === userId);
  if (u) {
    return u[3] === -1;
  }
  return false;
};

const getCardIdx = (game: Game, imgPath: string) => {
  return getIdxByValueOfFieldNumber(game, imgPath, 1);
  // return game.voteUserCardPointsVotedon.map(_ => _[1]).findIndex(img => img === imgPath);
};

const getIdxByValueOfFieldNumber = (game: Game, value: any, fieldNumber: number) => {
  return game.voteUserCardPointsVotedon.findIndex(v => v[fieldNumber] === value);
};

const userVoted = (game: Game, userId: string, votedOn: number) => {
  const uIdx = getIdxByValueOfFieldNumber(game, userId, 0);
  if (uIdx !== -1) {
    game.voteUserCardPointsVotedon[uIdx][3] = votedOn;
  } else {
    console.log('userVoted not found', userId, votedOn);
  }
};

const sendNewRoundInfo = (game: Game) => {
  sendGameStatus(game);
};

const hasEveryoneVoted = (game: Game): boolean => {
  return game.voteUserCardPointsVotedon
    .map(_ => _[3])
    .filter(votedOn => votedOn === -1)
    .length === 1;
  // storyteller cannot vote
};

const hasEveryoneSendCard = (game: Game): boolean => game.users.length === game.users.filter(u => u.selectedCard !== undefined).length;

const getSelectedCards = (game: Game): [string, string, number, number][] => {
  return game.users.map(u => [u.id, u.selectedCard || '', 0, -1]);
};

const sendGameStatus = (game: Game) => {
  sendMessage('game-' + game.name, game.dto());
};

const getUserCards = (game: Game, userId: string): string[] => {
  const id = userIdInGame(game, userId);
  // @ts-ignore
  return game.users[id].cards;
};

const userIdInGame = (game: Game, userId?: string) => {
  return game.usersIds.findIndex(id => id === userId);
};

const isUserInGame = (game: Game, userId?: string) => {
  return userIdInGame(game, userId) !== -1;
};

export const newRound = (request: NewRoundRequest) => {
  const game = getGames().get(request.gameName);
  if (game) {
    game.mutex
      ?.acquire()
      .then(release => {
        game.voteUserCardPointsVotedon = [];
        game.nextStoryTeller();
        game.sentence = ''; // or null ?
        game.state = GameState.NEW_ROUND;
        console.log('before sCards', game.users.map(u => u.selectedCard));
        for (const user of game.users) {
          user.selectedCard = undefined;
        }
        console.log('after sCards', game.users.map(u => u.selectedCard));
        game.users.forEach(u => u.selectedCard = undefined);
        sendNewRoundInfo(game);
        game.state = GameState.PLAYING;
        setGame(game);
        release();
      });
  }
};

export const voteOnCard = (request: SentenceOrCardRequest) => {
  const game = getGames().get(request.gameName);
  if (game && game.mutex) {
    game.mutex
      .acquire()
      .then(release => {
        if (hasUserNotVotedYet(game, request.id)) {
          const cardIdx = getCardIdx(game, request.cardPath);
          if (cardIdx !== undefined && cardIdx !== -1) {
            const votingUserIdx = getIdxByValueOfFieldNumber(game, request.id, 0);
            if (votingUserIdx === cardIdx) {
              // cant vote on myself
              sendErrorToUser(request.id, err('Cant vote on yourself card', 'Vote error', ErrorType.VOTE_ON_YOUSELF));
            } else {
              game.voteUserCardPointsVotedon[cardIdx][2]++;
              userVoted(game, request.id, cardIdx);
            }
          }
          if (hasEveryoneVoted(game)) {
            console.log('hasEveryoneVoted(game)', game.voteUserCardPointsVotedon);
            game.usersIds.forEach(id => sendMessage('vote-' + id, game.voteUserCardPointsVotedon));
            game.usersIds.forEach(id => sendMessage('vote-' + id, game.voteUserCardPointsVotedon));
          }
        }
        release();
      });
  }
};
