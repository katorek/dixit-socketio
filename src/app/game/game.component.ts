import {AfterViewInit, Component, OnInit, ViewChild} from '@angular/core';
import {GameService} from '../services/game.service';
import {ActivatedRoute} from '@angular/router';
import {Swiper, SwiperOptions} from 'swiper';
import {SessionService} from '../services/session.service';
import {FormBuilder, FormGroup, Validators} from '@angular/forms';
import {User} from '../../dixit-node-server/models/User';
import {Votings} from '../../dixit-node-server/models/Votings';

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  declare gameName: string;
  private maxSize: ImgSize = {width: 621.5, height: 913};
  preferences: Preferences = new Preferences(2, {width: 400, height: 587.6});
  declare sentenceForm: FormGroup;

  public config: SwiperOptions = {
    // a11y: { enabled: false },
    // direction: 'horizontal',
    slidesPerView: this.preferences.slidesPerView,
    keyboard: true,
    lazy: true,
    mousewheel: {sensitivity: 2},
    // scrollbar: false,
    navigation: true,
    observer: true,
    // pagination: true,
    loop: false,
    // freeMode: true,
    // freeModeMomentum: true,
    // freeModeMomentumRatio: 1,
    parallax: true,
    speed: 300,

    // scrollTo.behaviour = 'smooth',
    preloadImages: true,

    // updateOnWindowResize: true
  };


  constructor(private gameService: GameService,
              private sessionService: SessionService,
              private fb: FormBuilder,
              private route: ActivatedRoute) {
  }

  // selectedIdx = -1;
  get voteCardsShown() {
    return this.gameService.voteCardsShown;
  }

  switchCards() {
    this.gameService.voteCardsShown = !this.gameService.voteCardsShown;
    // this.selectedIdx = -1;
    this.gameService.selectedIdx = -1;
  }

  get selectedIdx() {
    return this.gameService.selectedIdx;
  }

  set selectedIdx(num: number){
    this.gameService.selectedIdx = num;
  }

  ngOnInit(): void {
    if (this.sessionService.preferences) {
      this.preferences = this.sessionService.preferences;
      this.config.slidesPerView = this.slides;
    }
    this.route.params.subscribe(params => this.gameName = params.gameName);
    // this.cards = this.setUpCards;

    this.gameService.subscribeGame(this.gameName);
    this.gameService.getGameInfo(this.gameName);
    this.sentenceForm = this.fb.group({
      sentence: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  get showVotes(): boolean {
    return this.gameService.everyoneVoted;
  }

  get storyTeller() {
    return this.game?.userStoryTeller;
  }

  get cards(): string[] {
    // return this.voteCardsShown ? this.gameService.voteCards : this.gameService.cards;
    return this.gameService.cards;
  }

  get voteCards(): Votings[] {
    return this.gameService.voteCards;
  }

  get alreadySendCard() {
    return this.gameService.alreadySendCard;
  }

  get slides() {
    return this.preferences.slidesPerView;
  }

  get width() {
    return this.preferences.imgSize.width;
  }

  get height() {
    return this.preferences.imgSize.height;
  }

  get game() {
    if (this.gameService.currentGame) {
      return this.gameService.currentGame;
    } else {
      return null;
    }
  }

  get amStoryTeller() {
    return this.gameService.amStoryTeller;
  }

  get sentence() {
    return this.game?.sentence;
  }

  get selectedCardPath() {
    if (this.voteCardsShown) {
      return this.voteCards[this.selectedIdx].imgPath;
    }
    return this.cards[this.selectedIdx];
  }

  get newRoundButtonDisabled() {
    return !this.amStoryTeller || !this.gameService.everyoneVoted;
  }

  confirm() {
    if (this.voteCardsShown) {
      this.gameService.voteForCard(this.selectedCardPath);
      // vote for image
    } else {
      this.gameService.sendSelection(this.selectedCardPath, this.sentenceForm.value);
      this.sentenceForm.reset();
    }
  }

  changeSize(x: number) {
    this.preferences.imgSize.width += 7 * x;
    this.preferences.imgSize.height += 10.3 * x;
    this.sessionService.updatePreferences(this.preferences);
  }

  addCard(num: number) {
    this.preferences.slidesPerView = (num > 0) ?
      Math.min(this.preferences.slidesPerView + num, 6) :
      Math.max(this.preferences.slidesPerView + num, 1);
    this.config.slidesPerView = this.preferences.slidesPerView;
    this.sessionService.updatePreferences(this.preferences);
  }

  imageClicked(index: number) {
    console.log('imageClicked', index);
    this.selectedIdx = (this.selectedIdx === index) ? -1 : index;
  }

  userSummary(user: User) {
    return `${user.id === this.game?.userStoryTeller ? '⃰ ' : ''}${user.username} ${user.points || 0}`;
  }

  isConfirmButtonDisabled() {
    if (this.voteCardsShown) {
      if (this.amStoryTeller) {
        return true;
      }
      if (this.selectedIdx !== -1) {
        return false;
      }

    }
    if (this.alreadySendCard) {
      return true;
    } else {
      if (this.amStoryTeller && (!this.sentenceForm.valid || this.selectedIdx === -1)) {
        return true;
      } else if (!this.amStoryTeller && (!this.sentence || (this.sentence && this.selectedIdx === -1))) {
        return true;
      }
    }
    return false;
  }

  printDebug() {
    console.log('----------------------------');
    console.log('voteCardsSho?', this.voteCards);
    console.log('voteCardsSho?', this.voteCardsShown);
    console.log('selectedIdx ?', this.selectedIdx);
    console.log('card?       ?', this.alreadySendCard);
    console.log('storyteller ?', this.amStoryTeller);
    console.log('formValid   ?', this.sentenceForm.valid);
    console.log('selectedIdx ?', this.selectedIdx);
    console.log('sentence    ?', this.sentence);
    console.log('----------------------------');
  }

  isCardSelected(index: number) {
    if (this.alreadySendCard) {
      return false;
    }
    if (this.amStoryTeller && this.selectedIdx === index && !this.sentence) {
      return true;
    }
    return !this.amStoryTeller && this.selectedIdx === index;
  }

  newRound() {
    this.gameService.requestNewRound();
  }
}

interface ImgSize {
  width: number;
  height: number;
}

class Preferences {
  declare slidesPerView: number;
  declare imgSize: ImgSize;

  constructor(slidesPerView: number, imgSize: ImgSize) {
    this.slidesPerView = slidesPerView;
    this.imgSize = imgSize;
  }
}
