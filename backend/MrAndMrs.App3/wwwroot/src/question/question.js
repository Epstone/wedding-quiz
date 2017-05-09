import { inject } from 'aurelia-framework';
import { SignalrService } from 'services/signalr-service';
import { EventAggregator } from 'aurelia-event-aggregator';
import { Router } from 'aurelia-router';

@inject(SignalrService, EventAggregator, Router)
export class question {
    constructor(signalrService, eventAggregator, router) {
        this.message = 'Hello World!';
        this.isModerator = false;
        this.signalrService = signalrService;
        this.eventAggregator = eventAggregator;
        this.router = router;
        this.isLastQuestion = false;
        this.selectedAnswer =  -1;
    }

    activate(params) {
        var self = this;
        self.gameId = params.gameId;

        this.signalrService.verifyConnected(params.gameId)
            .then((game) => {
                self.game = game;
                this.eventAggregator.subscribe("questionChangeRequested", function (updatedQuestionIndex) {
                    console.log("view should change question now.");
                    self.questionIndex = updatedQuestionIndex;
                    self.currentQuestion = game.questions[self.questionIndex];
                    self.isLastQuestion = (self.questionIndex + 1 === game.questions.length);
                    self.selectedAnswer = -1;
                });

                this.eventAggregator.subscribe("answerSelected", function (info) {
                    console.log("some user selected answer", info);
                });

                this.eventAggregator.subscribe("gameEnded", function () {
                    console.log("moderator as finished game.");
                    self.router.navigateToRoute("highscore", {
                        gameId: self.gameId
                    });
                });

                console.log("question view activated with params", params);
                this.isModerator = params.isModerator === "true";
                this.questionIndex = game.currentQuestionIndex;
                this.currentQuestion = game.questions[this.questionIndex];
                this.isLastQuestion = (self.questionIndex + 1 === game.questions.length);
            });
    }

    nextQuestion() {
        var self = this;
        this.signalrService.verifyConnected()
            .then(() => self.signalrService.nextQuestion());
    }

    endGame() {
        var self = this;
        self.signalrService.verifyConnected()
            .then(() => self.signalrService.endGame());
    }

    selectAnswer(answer) {
        var index = this.questionIndex;
        this.selectedAnswer = answer;
        this.signalrService.selectAnswer(answer, index)
            .then(() => {
                console.log("user info: selected answer" + answer + "for questionIndex: " + index);
            });
    }


}
