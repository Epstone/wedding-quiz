import {HttpClient} from "aurelia-http-client";
import {Router} from 'aurelia-router';

let client = new HttpClient();

export class index {

    static inject() { return [Router]; }

    constructor(router){
        this.theRouter = router;
    }

    activate() {
        const hub = $.connection.postsHub;

        //$.ajax({
        //    url: '/api/Posts/GetPosts',
        //    method: 'GET',
        //    dataType: 'JSON',
        //    success: addPostsList
        //});

        //function addPostsList(posts) {
        //    $.each(posts, function (index) {
        //        var post = posts[index];
        //        addPost(post);
        //    });
        //}

        //function addPost(post) {
        //    $("#postsList").append(
        //            '<li><b>' + post.userName + '</b><br>' + post.text + '</li><br>'
        //         );
        //}

        $("#publishPostButton").click(function() {

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

        $.connection.hub.logging = true;
        $.connection.hub.start();
    }

    createGame() {
        console.log("create game start");

        client.post("/game/create")
            .then(data => {
                var game = JSON.parse(data.response);
                console.log("created game on server", game);
                this.theRouter.navigateToRoute("gameCreation", game);
            });

       
    }
}