import { inject } from 'aurelia-framework';
import { SignalrService } from 'services/signalr-service';

@inject(SignalrService)
export class question {
    constructor(signalrService) {
        this.message = 'Hello World!';
        this.isModerator = false;
        this.signalrService = signalrService;
    }

    activate(params) {
        console.log("question view activated with params", params);
        this.isModerator = params.isModerator === "true";
    }

    nextQuestion(){
        this.signalrService.nextQuestion();
    }
}
