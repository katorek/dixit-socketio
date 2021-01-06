export class CardRequest {
  declare cardPath: string;
  declare gameName: string;
  declare id: string;

  constructor(cardPath: string, gameName: string) {
    this.cardPath = cardPath;
    this.gameName = gameName;
  }
}
