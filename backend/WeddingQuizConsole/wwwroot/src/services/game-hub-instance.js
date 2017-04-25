export class GameHubInstance {
    constructor() {
        this.hub = null;

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

    getInstance() {
        return this.hub;
    }
}