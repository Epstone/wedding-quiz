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
    }

    activate(params) {
        var self = this;

        this.signalrService.verifyConnected()
            .then(() => {
                this.eventAggregator.subscribe("questionChangeRequested", function (updatedQuestionIndex) {
                    console.log("view should change question now.");
                    self.questionIndex = updatedQuestionIndex;
                    self.currentQuestion = self.game.questions[self.questionIndex];

                    self.isLastQuestion = (self.questionIndex + 1 === self.game.questions.length);
                })

                this.eventAggregator.subscribe("answerSelected", function (info) {
                    console.log("some user selected answer", info);
                });

                console.log("question view activated with params", params);
                this.isModerator = params.isModerator === "true";
                this.game = params.game;
                this.questionIndex = this.game.currentQuestionIndex;
                this.currentQuestion = this.game.questions[this.questionIndex];
                this.isLastQuestion = (self.questionIndex + 1 === self.game.questions.length);
            });
    }

    nextQuestion() {
        var self = this;
        this.signalrService.verifyConnected()
            .then(() => self.signalrService.nextQuestion(self.game.gameId));
    }

    endGame() {
        this.router.navigateToRoute("highscore", {
            game: self.game,
        });
    }

    selectAnswer(answer) {
        var index = this.questionIndex;
        this.signalrService.selectAnswer(answer, index)
            .then(() => {
                console.log("user info: selected answer" + answer + "for questionIndex: " + index);
            });
    }


}
