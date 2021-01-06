import {SettingsForm} from '../settingsForm';

export class GameRequest {
  declare name: string;
  declare settings?: SettingsForm;
  declare id: string;

  constructor(name: string, settings?: SettingsForm) {
    this.name = name;
    if (settings) {
      this.settings = settings;
    }
  }
}
