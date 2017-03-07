import {HttpClient} from "aurelia-http-client";
import {Router} from 'aurelia-router';

export class join {
    
    constructor() {
        this.name ="user";
        this.gameId ="key";
    }

    joinGame() {
        var client = new HttpClient();
        var postParams = { username: this.name, gameId: this.gameId };

        console.log("try to join game", postParams);

        client.createRequest("/game/join")
            .asPost()
            .withHeader('Content-Type', 'application/json; charset=utf-8')
            .withContent(postParams)
            .send()
            .then(data => {
                var game = JSON.parse(data.response);
                console.log("joined game", game);
                this.theRouter.navigateToRoute("lobby", game);
            });
    }
}
