export class NewRoundRequest {
    declare gameName: string;
    declare id: string;

    constructor(gameName: string) {
        this.gameName = gameName;
    }
}
