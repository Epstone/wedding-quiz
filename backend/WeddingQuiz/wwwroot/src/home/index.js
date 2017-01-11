import "fetch";
import {HttpClient, json} from "aurelia-fetch-client";

let httpClient = new HttpClient();

export class index {
    constructor() {
        this.message = "Hello World blub!";
    }

    createGame() {
        console.log("create game start");

        httpClient.fetch("http://jsonplaceholder.typicode.com/posts",
            {
                method: "POST",
                body: undefined
            }).then(response => response.json())
            .then(data => {
                console.log(data);
            });
    }
}