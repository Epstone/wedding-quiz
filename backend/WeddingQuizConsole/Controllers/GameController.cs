namespace WeddingQuizConsole.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Linq;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.WindowsAzure.Storage;
    using Microsoft.WindowsAzure.Storage.Table;
    using Models;
    using Storage;

    public class GameController : Controller
    {
        private GameRepository gameRepository;

        public GameController()
        {
            string connectionString = "UseDevelopmentStorage=true";
            gameRepository = new GameRepository(connectionString);
        }

        [HttpPost]
        public async Task<ActionResult> Create()
        {
            var game = await gameRepository.CreateGame();
            return Json(game);
        }

        [HttpPost]
        public async Task<ActionResult> Join([FromBody]JoinGameModel content)
        {
            // verify game existis
            var game = gameRepository.GetGame(content.GameId).Result;
            if (game != null)
            {
                var openConnections = PostsHub._connections.GetConnections(content.Username);

                if (openConnections.Any())
                {
                    return Json(new { Result = "already_connected", Game = game });
                }
                else
                {
                    // next request is the signalr connection request
                    await gameRepository.AddPlayerToGameAsync(content.Username, content.Username);
                    return Json(new { Result = "allow_connection", Game = game });
                }
            }
            return Json(new { Result = "invalid_gameId" });
        }


    }
}