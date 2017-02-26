namespace WeddingQuizConsole.Controllers
{
    using System;
    using System.Collections.Generic;
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.Mvc;
    using Microsoft.WindowsAzure.Storage;
    using Microsoft.WindowsAzure.Storage.Table;
    using Models;

    public class GameController : Controller
    {
        [HttpPost]
        public async Task<ActionResult> Create()
        {
            var game = await CreateGame();
            return Ok(game);
        }

        [HttpPost]
        public ActionResult JoinGame(string name, string gamecode, string userId)
        {
            // verify game code


            // verify user id or create a new one

            // result either: user name taken or user created successfully
            throw new NotImplementedException();
        }

        private static async Task<GameEntity> CreateGame()
        {
            var storageAccount = CloudStorageAccount.Parse("UseDevelopmentStorage=true");

            // Create the table client.
            var tableClient = storageAccount.CreateCloudTableClient();

            // Get a reference to a table named "peopleTable"
            var gameTable = tableClient.GetTableReference("game");

            // Create the CloudTable if it does not exist
            await gameTable.CreateIfNotExistsAsync();


            var game = new GameEntity();
            game.Questions = new List<string>
            {
                "Wer geht am Sonntag zum Bäcker?",
                "Wer wäscht ab?",
                "Wer räumt auf?",
                "Wer macht die Betten?",
                "Wer telefoniert häufiger mit Mutti?",
                "Wer treibt mehr Sport?",
                "Wer hat den besser durchtrainierten Körper?",
                "wer benötigt am Bad immer am längsten?",
                "Wer ist pünktlicher?",
                "Wer kommt immer zu spät?",
                "Wer ist lauter beim Sex?",
                "Wer hat mehr Lust auf Sex?",
                "Wer kann besser verlieren?",
                "Wer kann besser gewinnen?"
            };

            // Create the TableOperation that inserts the customer entity.
            var insertOperation = TableOperation.Insert(game);

            // Execute the insert operation.
            await gameTable.ExecuteAsync(insertOperation);

            return game;
        }
    }
}