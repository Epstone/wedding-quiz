export class GameHubSingleton {
    constructor() {
        this.hub = false;

    }


    createGameHub(username, gameId) {
        if (this.hub) {
            return hub;
        }

        var hub = $.connection.hub.createHubProxy("postsHub");
        $.connection.hub.qs = 'username=' + username + '&gameId=' + gameId;
        $.connection.hub.logging = true;

        this.hub = hub;
        return hub;
    }

    get instance() {
        return this.hub;
    }
}