namespace WeddingQuizConsole.Controllers
{
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using Storage;

    public class GameController : Controller
    {
        private readonly GameRepository gameRepository;

        public GameController()
        {
            var connectionString = "UseDevelopmentStorage=true";
            gameRepository = new GameRepository(connectionString);
        }

        [HttpPost]
        public async Task<JsonResult> Create()
        {
            var game = await gameRepository.CreateGame();
            return Json(game);
        }

        [HttpPost]
        public async Task<JsonResult> Join([FromBody] JoinGameModel content)
        {
            if (!ModelState.IsValid)
                return Json("error");

            // verify game existis
            var game = await gameRepository.GetGame(content.GameId);

            if (game == null)
                return Json(new JoinGameResult
                {
                    Result = "unknown_game_id"
                });

            var player = await gameRepository.GetPlayer(content.GameId, content.Username);

            if (player == null)
            {
                await gameRepository.AddPlayerToGameAsync(content.GameId, content.Username, content.AccountKey);
                return Json(new JoinGameResult
                {
                    Result = "allow_connection",
                    Game = game
                });
            }

            if (player.AccountKey == content.AccountKey)
                return Json(new JoinGameResult
                {
                    Result = "allow_connection",
                    Game = game
                });

            if (player.AccountKey != content.AccountKey)
                return Json(new JoinGameResult {Result = "username_taken"});


            return Json(new JoinGameResult {Result = "error"});
        }
    }
}