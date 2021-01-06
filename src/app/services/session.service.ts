import {Inject, Injectable} from '@angular/core';
import {LOCAL_STORAGE, StorageService} from 'ngx-webstorage-service';
import * as _ from 'lodash';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) {
  }

  showStorage() {
    console.log('localStorage', localStorage);
    console.log('sessionStorage', sessionStorage);
  }

  set(key: string, val: any): void {
    this.storage.set(key, val);
  }

  get(key: string): any {
    return this.storage.get(key) || '';
  }

  remove(key: string) {
    this.storage.remove(key);
  }

  setCards(cards: string[]) {
    this.storage.set('cards', cards);
  }

  addCard(card: string) {
    const cards = this.storage.get('cards');
    if (cards) {
      cards.push(card);
      this.storage.set('cards', cards);
    } else {
      this.storage.set('cards', []);
      this.addCard(card);
    }
  }

  clearCards() {
    this.storage.remove('cards');
  }

  updatePreferences(obj: any) {
    this.set('preferences', obj);
  }

  get preferences() {
    return this.storage.get('preferences');
  }
}
