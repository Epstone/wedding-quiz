import { inject } from 'aurelia-framework';
import { SignalrService } from 'services/signalr-service';
import { EventAggregator } from 'aurelia-event-aggregator';

@inject(SignalrService, EventAggregator)
export class question {
    constructor(signalrService, eventAggregator) {
        this.message = 'Hello World!';
        this.isModerator = false;
        this.signalrService = signalrService;
        this.eventAggregator = eventAggregator;
    }

    activate(params) {
        var self = this;

        this.signalrService.verifyConnected("moderator") // todo
            .then(() => {
                this.eventAggregator.subscribe("questionChangeRequested", function () {
                    console.log("view should change question now.");
                    self.questionIndex++;
                    self.currentQuestion = self.game.questions[self.questionIndex];
                })

                this.eventAggregator.subscribe("answerSelected", function (info) {
                    console.log("some user selected answer", info);
                });

                console.log("question view activated with params", params);
                this.isModerator = params.isModerator === "true";
                this.game = params.game;
                this.questionIndex = Number.parseInt(params.questionIndex, 10);
                this.currentQuestion = this.game.questions[this.questionIndex];
            });
    }

    nextQuestion() {
        var self = this;
        this.signalrService.verifyConnected('question.js') // todo where should this come from?
            .then(() => self.signalrService.nextQuestion());
    }

    selectAnswer(answer) {
        this.signalrService.selectAnswer(answer)
            .then(() => {
                console.log("user info: selected " + answer);
            });
    }


}
