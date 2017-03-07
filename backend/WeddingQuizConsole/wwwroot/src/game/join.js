import {HttpClient} from "aurelia-http-client";
import {Router} from 'aurelia-router';

export class join {
    
    constructor() {
        this.name ="paul_panzer";
        this.gameId ="150D3274";
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
                var result = JSON.parse(data.response);
                console.log("result", result);
                //this.theRouter.navigateToRoute("lobby", game);
            });
    }
}
