import { HttpClient } from "aurelia-http-client";

export class highscore {
    constructor() {
        this.message = 'Hello World!';
    }

    activate() {
        var client = new HttpClient();
        this.game = {
            questionIndex: 3,
            isFinished: false,
            questions: [],
            highscore: [
                { name: "Paul", score: 7 },
                { name: "Matthias", score: 5 },
                { name: "Arno", score: 3 },
            ]
        }

        this.answerStatistics = {
            mrs: 6,
            mr: 5,
            both: 0
        };

        this.totalPlayers = 11;

        this.statsMrs = this.calculatePercentage(this.answerStatistics.mrs, this.totalPlayers);
        this.statsMr = this.calculatePercentage(this.answerStatistics.mr, this.totalPlayers);
        this.statsBoth = this.calculatePercentage(this.answerStatistics.both, this.totalPlayers);
    }

    calculatePercentage(count, total) {
        return  Math.floor((count / total) * 100);
    }
}
