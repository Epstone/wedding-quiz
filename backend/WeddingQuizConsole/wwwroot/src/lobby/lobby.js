import { signalrService } from 'services/signalr-service';
import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';

@inject(signalrService, EventAggregator, Router)
export class join {
    constructor(signalrService, eventAggregator, router) {
        console.log("lobby.js: received signalr service in constructor")
        this.message = 'Hello World!';
        this.playerlist = ["Noch keine Spieler"];
        this.signalrService = signalrService;
        this.eventAggregator = eventAggregator;
        this.router = router;
    }

    activate(joinDetails) {
        var self = this;
        console.log("welcome to the lobby");

        var game = joinDetails.game;
        var username = joinDetails.username;

        this.signalrService.verifyConnected(username)
            .then(() => {
                this.eventAggregator.subscribe('playerListUpdated', (updatedPlayerList) => {
                    console.log("we should update playerlist now. yes works")
                    console.log(updatedPlayerList);
                    self.playerlist = updatedPlayerList;
                })

                this.eventAggregator.subscribe("gameStarted", () => {
                    self.router.navigateToRoute("question", {
                        isModerator: false,
                        game: null
                    });
                });
            });
    }
}
