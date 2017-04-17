import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class SignalrService {
  constructor(eventAggregator) {
    console.log("signalr service constructor created")
    this.eventAggregator = eventAggregator;
  }

  activate(params) {
    console.log("signalr service activated")
  }

  getGameId() {
    var gameId = window.localStorage.getItem("currentGame");
    if (!gameId) {
      throw "No gameId currently attached to.";
    }

    return gameId;
  }

  verifyConnected(gameId) {
    var username = window.localStorage.getItem("username");

    if (!gameId) {
      gameId = this.getGameId();
    }

    var self = this;

    var promise = new Promise(
      (resolve, reject) => {

        // already connected hack
        if (!!self.gameHub) {
          resolve(self.game);
          return;
        }

        var gameHub = $.connection.hub.createHubProxy("postsHub");
        self.gameHub = gameHub;

        $.connection.hub.qs = 'username=' + username + '&gameId=' + gameId;
        $.connection.hub.logging = true;

        gameHub.on('playerListUpdated', function (updatedPlayerlist) {
          console.log("Received playerlist");
          console.log(updatedPlayerlist);
          self.eventAggregator.publish('playerListUpdated', updatedPlayerlist);
        });

        gameHub.on("gameStarted", function (game) {
          console.log("server signalled game was started by moderator");
          self.eventAggregator.publish('gameStarted', game);
        });

        gameHub.on("questionChangeRequested", function (response) {
          console.log("server signalled question change", response);
          self.eventAggregator.publish('questionChangeRequested', response);
        });

        gameHub.on("answerSelected", function (response) {
          console.log("user selected answer", response);
          self.eventAggregator.publish('answerSelected', response);
        });

        gameHub.on("gameEnded", function (response) {
          console.log("moderator has finished the game", response);
          self.eventAggregator.publish('gameEnded', response);
        });

        gameHub.on("gameUpdated", function (response) {
          self.game = response;
          resolve(response);
          console.log("server sent updated game.", response);
          self.eventAggregator.publish('gameUpdated', response);
        });

        $.connection.hub.start().done(function () {
          console.log("hub is started now.");
          gameHub.invoke('updatePlayerList');
        });

      }
    );

    return promise;
  }

  startGame(gameId) {
    return new Promise((resolve, reject) => {
      console.log("triggered game start");
      this.gameHub.server.startGame(gameId).done(() => {
        console.log("game started successfully");
        resolve();
      });
    });
  }

  nextQuestion() {
    var self = this;
    console.log("moderator switches to next question");
    return new Promise((resolve, reject) => {
      this.gameHub.server.showNextQuestion(self.game.gameId).done(() => {
        console.log("next question request sent.")
      });
    });
  }

  selectAnswer(answer, questionIndex) {
    return new Promise((resolve, reject) => {
      this.gameHub.server.selectAnswer(answer, questionIndex).done(() => {  // todo user info
        console.log("selected answer sent to server", answer, questionIndex);
      });
    });
  }

  endGame() {
    var self = this;
    return new Promise((resolve, reject) => {
      self.gameHub.server.endGame(self.game.gameId).done(() => {
        console.log("request end game on server.");
        resolve();
      });
    });
  }
}

