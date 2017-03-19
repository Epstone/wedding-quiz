import { signalrService } from 'services/signalr-service';
import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(signalrService, EventAggregator)
export class create {
    constructor(signalrService, eventAggregator) {
        this.message = 'Hello World!';
        this.playerlist = ["Noch keine Spieler"];
        this.signalrService = signalrService;
        this.eventAggregator = eventAggregator;
    }

    questions = [];

    activate(params, routeData) {
        var self = this;
        console.log("passed game from other view", params, routeData);
        this.questions = params.questions;

        this.signalrService.verifyConnected("moderator")
            .then(() => {
                this.eventAggregator.subscribe('playerListUpdated', (updatedPlayerList) => {
                    console.log("we should update playerlist now for moderator view.")
                    console.log(updatedPlayerList);
                    self.playerlist = updatedPlayerList;
                })
            });
    }
}
