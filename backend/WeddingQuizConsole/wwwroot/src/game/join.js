import { HttpClient } from "aurelia-http-client";
import { Router } from 'aurelia-router';

export class join {

    static inject() { return [Router]; }

    constructor(router) {
        this.name = "";
        this.gameId = "";
        this.theRouter = router;
    }

    guid() {
        return this.s4() + this.s4() + '-' + this.s4() + '-' + this.s4() + '-' +
            this.s4() + '-' + this.s4() + this.s4() + this.s4();
    }

    s4() {
        return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
    }

    joinGame() {
        var client = new HttpClient();

        var accountKey = window.localStorage.getItem("accountKey");
        if(!accountKey){
            accountKey = this.guid();
            window.localStorage.setItem("accountKey", accountKey);
        }

        var postParams = {
            username: this.name,
            gameId: this.gameId,
            accountKey : accountKey
        };

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
                    if (typeof (Storage) !== "undefined") {
                        // Code for localStorage/sessionStorage.
                        window.localStorage.setItem("username", postParams.username);
                        window.localStorage.setItem("currentGame", result.game.gameId);
                        window.localStorage.setItem("isModerator", false);
                    } else {
                        alert("Sorry, no support for your browser.")
                        return;
                    }

                    // -> lobby
                    if (result.game.state === 0) {
                        this.theRouter.navigateToRoute("lobby", {
                            gameId: result.game.gameId,
                            username: postParams.username
                        });
                    }

                    // -> question
                    if (result.game.state === 1) {
                        this.theRouter.navigateToRoute("question", {
                            gameId: result.game.gameId,
                        });
                    }

                    // -> question
                    if (result.game.state === 2) {
                        this.theRouter.navigateToRoute("highscore", {
                            gameId: result.game.gameId,
                        });
                    }


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
