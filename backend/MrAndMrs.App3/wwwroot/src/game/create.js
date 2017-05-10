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
        this.questionsModel = [];
    }

    questions = [];

    activate(game, routeData) {
        var self = this;
        console.log("passed game from other view", game, routeData);
        this.questions = game.questions;
        this.game = game;
        for (var i = 0; i < this.questions.length; i++) {
            this.questionsModel.push({
                 text : this.questions[i],
                 editActive : false,
                 editAction : this.changeEditState
             });
        }

        console.log("questions model is", this.questionsModel);

        window.localStorage.setItem("username", "moderator");
        window.localStorage.setItem("currentGame", game.gameId);
        window.localStorage.setItem("isModerator", true);


        this.signalrService.verifyConnected(game.gameId)
            .then(() => {
                this.eventAggregator.subscribe('playerListUpdated', (updatedPlayerList) => {
                    console.log("we should update playerlist now for moderator view.")
                    console.log(updatedPlayerList);
                    self.playerlist = updatedPlayerList;
                });

                self.gameId = game.gameId
            });
    }

    changeEditState(par){
        this.editActive = !this.editActive;
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
