export class join {
    constructor() {
        this.message = 'Hello World!';
    }

    activate() {
        console.log("welcome to the lobby");

        const hub = $.connection.postsHub;
        $.connection.hub.logging = true;
        $.connection.hub.start();
        debugger;
        $.connection.hub.client.broadcastMessage = function(message) {
            console.log(message);
        }

    }
}
