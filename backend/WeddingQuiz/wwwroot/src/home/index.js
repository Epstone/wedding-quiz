//let httpClient = new HttpClient();

export class index {
    constructor() {
        this.message = "Hello World blub!";
    }

    activate() {
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
        debugger;
        var hub = $.connection.postsHub;

        hub.client.publishPost = addPost;

        $("#publishPostButton").click(function () {

            var post = {
                userName: $("#userNameInput").val() || "Guest",
                text: $("#textInput").val()
            };
            $.ajax({
                url: '/api/Posts/AddPost',
                method: 'POST',
                data: post
            });
        });

        $.connection.hub.logging = true;
        $.connection.hub.start();
    }

    createGame() {
        //console.log("create game start");

        //httpClient.fetch("http://jsonplaceholder.typicode.com/posts",
        //    {
        //        method: "POST",
        //        body: undefined
        //    }).then(response => response.json())
        //    .then(data => {
        //        console.log(data);
        //    });


    }
}