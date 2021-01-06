export class Votings {
  declare userId: string;
  declare imgPath: string;
  declare points: number;
  declare votedOnIdx: number;
  declare usernamesThatVotedOn?: string[];
  declare username?: string;

  constructor(userId: string, imgPath: string, points: number, votedOnIdx: number) {
    this.userId = userId;
    this.imgPath = imgPath;
    this.points = points;
    this.votedOnIdx = votedOnIdx;
  }

  static fromArr(votings: [string, string, number, number][]) {
    return votings.map(_ => new Votings(_[0], _[1], _[2], _[3]));
  }
}
