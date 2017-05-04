import { HttpClient } from "aurelia-http-client";
import { EventAggregator } from 'aurelia-event-aggregator';
import { SignalrService } from 'services/signalr-service';
import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';

@inject(SignalrService, EventAggregator, Router)
export class highscore {
    constructor(signalrService, eventAggregator, router) {
        this.message = 'Hello World!';
        this.eventAggregator = eventAggregator;
        this.signalrService = signalrService;
        this.currentQuestion = "test";
        this.highscoreTableModel = {
            first: {
                names: "?",
                score: "?"
            },
            second: {
                names: "?",
                score: "?"
            },
            third: {
                names: "?",
                score: "?"
            }
        };
    }

    activate(params) {
        var self = this;
        this.signalrService.verifyConnected(params.gameId)
            .then((game) => {
                self.game = game;
                console.log("received game on connected state", game);
                return game;
            });

        this.eventAggregator.subscribe("highscoreUpdated", function (highscore) {
            console.log("highscore should be updated.", highscore);
            self.highscoreTableModel = highscore;
        });

        this.eventAggregator.subscribe("gameUpdated", function (game) {
            console.log("game updated.", game);
            self.game = game;
            self.currentQuestion = game.questions[game.currentQuestionIndex];
        });

        this.game = {
            questions: [],
        };

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
        return Math.floor((count / total) * 100);
    }
}
