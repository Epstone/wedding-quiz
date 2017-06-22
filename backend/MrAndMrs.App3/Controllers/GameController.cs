namespace MrAndMrs.App3.Controllers
{
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using Storage;

    public class GameController : Controller
    {
        private readonly GameRepository gameRepository;

        public GameController(GameRepository gameRepository)
        {
            this.gameRepository = gameRepository;
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
                    Result = "Der Spielcode ist nicht korrekt. Bitte korrigiere ihn nochmal."
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
                return Json(new JoinGameResult {Result = "Der Spielername ist bereits vergeben. Bitte gib einen anderen Namen ein."});


            return Json(new JoinGameResult {Result = "error"});
        }
    }
}