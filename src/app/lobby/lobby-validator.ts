import {FormControl, Validators} from '@angular/forms';

export class LobbyValidator extends Validators {

  static validateLink(control: FormControl) {
    return true;
  }
}
