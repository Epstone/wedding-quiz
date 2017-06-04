import { SignalrService } from 'services/signalr-service';
import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';

@inject(SignalrService, EventAggregator, Router)
export class join {
    constructor(signalrService, eventAggregator, router) {
        console.log("lobby.js: received signalr service in constructor")
        this.message = 'Hello World!';
        this.playerlist = ["Noch keine Spieler"];
        this.signalrService = signalrService;
        this.eventAggregator = eventAggregator;
        this.router = router;
    }

    activate(params) {
        var self = this;
        console.log("welcome to the lobby");

        this.signalrService.verifyConnected(params.gameId)
            .then(() => {
                this.eventAggregator.subscribe('playerListUpdated', (updatedPlayerList) => {
                    console.log("we should update playerlist now.")
                    console.log(updatedPlayerList);
                    self.playerlist = updatedPlayerList;
                })

                this.eventAggregator.subscribe("gameStarted", (game) => {
                    self.router.navigateToRoute("question", {
                        isModerator: false,
                        gameId: game.gameId,
                    });
                });
            });
    }
}
