using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeddingQuizConsole.Storage
{
    using Microsoft.WindowsAzure.Storage;
    using Microsoft.WindowsAzure.Storage.Table;
    using Models;

    public class GameRepository
    {
        private readonly string connectionString;

        public GameRepository(string connectionString)
        {
            this.connectionString = connectionString;
        }
        internal async Task<GameEntity> CreateGame()
        {
            var gameTable = await GetGameTable();

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

            var insertOperation = TableOperation.Insert(game);
            await gameTable.ExecuteAsync(insertOperation);

            return game;
        }

        private async Task<CloudTable> GetGameTable()
        {
            var tableClient = CreateTableClient();
            var gameTable = tableClient.GetTableReference("game");

            // Create the CloudTable if it does not exist
            await gameTable.CreateIfNotExistsAsync();
            return gameTable;
        }

        private CloudTableClient CreateTableClient()
        {
            var storageAccount = CloudStorageAccount.Parse(connectionString);

            // Create the table client.
            var tableClient = storageAccount.CreateCloudTableClient();
            return tableClient;
        }
    }
}
