export class join {
    constructor() {
        this.message = 'Hello World!';
    }

    activate() {
        console.log("welcome to the lobby");

       
        var gameHub = $.connection.hub.createHubProxy("postsHub");
           
        gameHub.on('broadcastMessage', function(name, message) {
            console.log(name + ' ' + message);
        });


        $.connection.hub.logging = true;
        $.connection.hub.start().done(function() {
            console.log("hub is started now.");
            gameHub.invoke('setName', "test");
            
        });

    }
}
