export class question {
    constructor() {
        this.message = 'Hello World!';
        this.isModerator = false
    }

    activate(params) {
        console.log("question view activated with params ", params);
        debugger;
        this.isModerator = params.isModerator === "true";
    }

    nextQuestion(){
        
    }
}
