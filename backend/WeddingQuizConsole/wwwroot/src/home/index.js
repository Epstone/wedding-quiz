import {HttpClient} from "aurelia-http-client";
let client = new HttpClient();

export class index {
    constructor() {
        this.message = "Hello World blub!";
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
                console.log(data.response);
            });

       
    }
}