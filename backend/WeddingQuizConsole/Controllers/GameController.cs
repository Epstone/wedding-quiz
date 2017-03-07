namespace WeddingQuizConsole.Controllers
{
    using System;
    using System.Collections.Generic;
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
        public ActionResult Join([FromBody]dynamic content)
        {
            // verify game existis
            gameRepository.IsGameExisting(content.gameId);
            // verify player with same name is not already connected via hub

            // if not yet connected
            gameRepository.AddPlayerToGame(content.gameId, content.username); 

            // verify user id or create a new one

            // result either: user name taken or user created successfully
            throw new NotImplementedException();
        }

        
    }
}