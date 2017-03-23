import { SignalrService } from 'services/signalr-service';
import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';

@inject(SignalrService, EventAggregator, Router)
export class create {
    constructor(signalrService, eventAggregator, router) {
        this.message = 'Hello World!';
        this.playerlist = ["Noch keine Spieler"];
        this.signalrService = signalrService;
        this.eventAggregator = eventAggregator;
        this.router = router;
    }

    questions = [];

    activate(game, routeData) {
        var self = this;
        console.log("passed game from other view", game, routeData);
        this.questions = game.questions;
        this.game = game;

        window.localStorage.setItem("username", "Moderator");
        window.localStorage.setItem("currentGame", game.gameId);
        window.localStorage.setItem("isModerator", true);


        this.signalrService.verifyConnected("moderator")
            .then(() => {
                this.eventAggregator.subscribe('playerListUpdated', (updatedPlayerList) => {
                    console.log("we should update playerlist now for moderator view.")
                    console.log(updatedPlayerList);
                    self.playerlist = updatedPlayerList;
                });
            });
    }

    startGame() {
        var self = this;
        this.signalrService.startGame(self.game.gameId)
            .then(() => {
                console.log("change view now");


                self.router.navigateToRoute("question", {
                    isModerator: true,
                    game: self.game,
                    questionIndex: 0
                });
            });
    }
}
