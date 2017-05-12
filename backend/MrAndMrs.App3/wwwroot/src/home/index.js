import { HttpClient } from "aurelia-http-client";
import { Router } from 'aurelia-router';

let client = new HttpClient();

export class index {

    static inject() { return [Router]; }

    constructor(router) {
        this.theRouter = router;
    }

    activate() {
        $("#publishPostButton").click(function () {

            const post = {
                userName: $("#userNameInput").val() || "Guest",
                text: $("#textInput").val()
            };
            $.ajax({
                url: "/api/Posts/AddPost",
                method: "POST",
                data: post
            });
        });
    }

    createGame() {
        console.log("create game start");

        client.post("/game/create")
            .then(data => {
                var game = JSON.parse(data.response);
                console.log("created game on server", game);
                this.theRouter.navigateToRoute("gameCreation", { gameId: game.gameId });
            });
    }
}