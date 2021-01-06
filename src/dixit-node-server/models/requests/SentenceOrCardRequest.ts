export class SentenceOrCardRequest {
  declare sentence: string;
  declare cardPath: string;
  declare gameName: string;
  declare id: string;

  constructor(sentence: string, cardPath: string, gameName: string) {
    this.sentence = sentence;
    this.cardPath = cardPath;
    this.gameName = gameName;
  }
}
