export class join {
    constructor() {
        this.message = 'Hello World!';
        this.playerlist = ["Noch keine Spieler"];
    }

    activate(joinDetails) {
        var self = this;
        console.log("welcome to the lobby");
        var game = joinDetails.game;
        var username = joinDetails.username;


        var gameHub = $.connection.hub.createHubProxy("postsHub");
        $.connection.hub.qs = 'username=' + username;
        gameHub.on('playerListUpdated', function (updatedPlayerlist) {
            console.log("received playerlist");
            console.log(updatedPlayerlist);
            self.playerlist = updatedPlayerlist;
        });


        $.connection.hub.logging = true;
        $.connection.hub.start().done(function () {
            console.log("hub is started now.");
            gameHub.invoke('updatePlayerList');
        });

    }
}
