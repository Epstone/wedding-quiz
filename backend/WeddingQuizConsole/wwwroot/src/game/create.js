export class create {
    
    questions = [];

    constructor() {
        this.message = 'Hello World!';
    }

    activate(params, routeData) {
        console.log("passed game from other view", params, routeData);
        this.questions = params.questions;
    }
}
