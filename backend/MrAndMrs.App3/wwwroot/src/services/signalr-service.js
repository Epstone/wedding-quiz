import { inject } from 'aurelia-framework';
import { EventAggregator } from 'aurelia-event-aggregator';
import { GameHubSingleton } from 'services/game-hub-singleton';

@inject(EventAggregator, GameHubSingleton)
export class SignalrService {
  constructor(eventAggregator, gameHub) {
    console.log("signalr service constructor created")
    this.eventAggregator = eventAggregator;
    this.gameHub = gameHub;
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
        if (!!self.gameHub.instance) {
          resolve(self.game);
          return;
        }
        var gameHub = self.gameHub.createGameHub(username, gameId);

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

        gameHub.on("gameUpdated", function (game) {
          self.game = game;
          resolve(game);
          console.log("server sent updated game.", game);
          self.eventAggregator.publish('gameUpdated', game);
        });

        gameHub.on("highscoreUpdated", function (highscore) {
          console.log("server sent highscore update.", highscore);
          self.eventAggregator.publish('highscoreUpdated', highscore);
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
    var self = this;
    return new Promise((resolve, reject) => {
      console.log("triggered game start");
      self.gameHub.instance.server.startGame(gameId).done(() => {
        console.log("game started successfully");
        resolve();
      });
    });
  }

  nextQuestion() {
    var self = this;
    console.log("moderator switches to next question");
    return new Promise((resolve, reject) => {
      self.gameHub.instance.server.showNextQuestion(self.game.gameId).done(() => {
        console.log("next question request sent.");
        resolve();
      });
    });
  }

  selectAnswer(answer, questionIndex) {
    var self = this;
    return new Promise((resolve, reject) => {
      self.gameHub.instance.server.selectAnswer(answer, questionIndex).done(() => {  // todo user info
        console.log("selected answer sent to server", answer, questionIndex);
        resolve();
      });
    });
  }

  endGame() {
    var self = this;
    return new Promise((resolve, reject) => {
      self.gameHub.instance.server.endGame(self.game.gameId).done(() => {
        console.log("request end game on server.");
        resolve();
      });
    });
  }

  getHighscore() {
    var self = this;
    self.gameHub.instance.server.getHighscore(self.game.gameId).done(() => {
      console.log("request get highscore was received on server.");
    });
  }

  updateQuestions(questions) {
    var self = this;
    return new Promise((resolve, reject) => {
      self.gameHub.instance.server.updateQuestions(self.game.gameId, questions).done(() => {
        console.log("update questions request was received on server.");
        resolve();
      });
    });
  }
}

