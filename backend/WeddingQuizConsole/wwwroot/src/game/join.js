import { HttpClient } from "aurelia-http-client";
import { Router } from 'aurelia-router';

export class join {

    static inject() { return [Router]; }

    constructor(router) {
        this.name = "paul_panzer";
        this.gameId = "150D3274";
        this.theRouter = router;
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

                if (result.result === "allow_connection") {
                    this.theRouter.navigateToRoute("lobby", {
                        game: result.game,
                        username: postParams.username
                    });
                } else {
                    alert(result.result);
                }

            });
    }
    
    showHighscore() {
        this.theRouter.navigateToRoute("highscore", {
            gameId: this.gameId,
        });
    }

}
