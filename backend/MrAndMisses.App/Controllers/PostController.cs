namespace WeddingQuizConsole.Controllers
{
    using System.Collections.Generic;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.AspNetCore.SignalR.Infrastructure;

    public class PostsController : Controller
    {
        private IConnectionManager _connectionManager { get; set; }

        public PostsController(IConnectionManager connectionManager)
        {
            _connectionManager = connectionManager;
        }

        [HttpGet]
        public List<string> GetPosts()
        {
            return new List<string>() {"test1","test2" };
        }

        [HttpGet]
        public string GetPost(int id)
        {
            return "hello world";
        }

        [HttpPost]
        public void AddPost(string post)
        {
        
            _connectionManager.GetHubContext<PostsHub>().Clients.All.publishPost(post);
        }
    }
}