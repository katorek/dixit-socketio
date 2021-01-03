import {Inject, Injectable} from '@angular/core';
import {LOCAL_STORAGE, StorageService} from 'ngx-webstorage-service';

@Injectable({
  providedIn: 'root'
})
export class SessionService {

  constructor(@Inject(LOCAL_STORAGE) private storage: StorageService) {
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
}
