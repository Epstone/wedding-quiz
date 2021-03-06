import { SignalrService } from 'services/signalr-service';
import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';

@inject(SignalrService, EventAggregator, Router)
export class create {
    constructor(signalrService, eventAggregator, router) {
        this.playerlist = ["Noch keine Spieler"];
        this.signalrService = signalrService;
        this.eventAggregator = eventAggregator;
        this.router = router;
        this.nameMr = "";
        this.nameMrs = "";
    }

    questions = [];

    activate(params) {
        var self = this;
        this.gameId = params.gameId;
        window.localStorage.setItem("username", "moderator");
        window.localStorage.setItem("currentGame", this.gameId);
        window.localStorage.setItem("isModerator", true);

        this.signalrService.verifyConnected(this.gameId)
            .then((game) => {
                self.game = game;
                self.questions = game.questions;

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
                    gameId: self.game.gameId
                });
            });
    }
}
