import { HttpClient } from "aurelia-http-client";
import { EventAggregator } from 'aurelia-event-aggregator';
import { SignalrService } from 'services/signalr-service';
import { inject } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import {computedFrom} from 'aurelia-framework';

@inject(SignalrService, EventAggregator, Router)
export class highscore {
    constructor(signalrService, eventAggregator, router) {
        this.message = 'Hello World!';
        this.isFinished = false;
        this.eventAggregator = eventAggregator;
        this.signalrService = signalrService;
        this.currentQuestion = "test";
        this.highscoreTableModel = {
            Entries: [{
                names: "?",
                score: "?"
            }],
        };

        this.answerStatistics = {
            mrs: 0,
            mr: 0,
            both: 0
        };
    }

    activate(params) {
        var self = this;


        this.eventAggregator.subscribe("highscoreUpdated", function (highscore) {
            console.log("highscore should be updated.", highscore);
            self.highscoreTableModel = highscore;
        });

        this.eventAggregator.subscribe("gameUpdated", function (game) {
            console.log("game updated.", game);
            self.game = game;
            self.currentQuestion = game.questions[game.currentQuestionIndex];
        });

        this.eventAggregator.subscribe("answerSelected", function (statistics) {
            console.log("Answer statistic updated.", statistics);
            self.answerStatistics = statistics;
        });

        this.eventAggregator.subscribe("playerListUpdated", function (playerList) {
            self.totalPlayers = playerList.length;
        });

        this.game = {
            questions: [],
        };

        this.signalrService.verifyConnected(params.gameId)
            .then((game) => {
                self.game = game;
                console.log("received game on connected state", game);
                self.signalrService.getHighscore();
                return game;
            });
    }

    @computedFrom
    get statsMrs() {
        return this.calculatePercentage(this.answerStatistics.mrs, this.totalPlayers);
    }

    @computedFrom
    get statsMr() {
        return this.calculatePercentage(this.answerStatistics.mr, this.totalPlayers);
    }
    
    @computedFrom
    get statsBoth() {
        return this.calculatePercentage(this.answerStatistics.both, this.totalPlayers);
    }

    calculatePercentage(count, total) {
        return Math.floor((count / total) * 100);
    }
}
