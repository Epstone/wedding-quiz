using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeddingQuizConsole.Storage
{
    using System.Diagnostics;
    using Entities;
    using Microsoft.Extensions.Primitives;
    using Microsoft.WindowsAzure.Storage;
    using Microsoft.WindowsAzure.Storage.Table;
    using Models;

    public class GameRepository
    {
        private readonly string connectionString;
        private static readonly string GameTableName = "game";
        private static readonly string Partitionkey = "PartitionKey";

        public GameRepository(string connectionString)
        {
            this.connectionString = connectionString;
        }
        internal async Task<GameEntity> CreateGame()
        {
            var gameTable = await GetTable(GameTableName);

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

        private async Task<CloudTable> GetTable(string tableName)
        {
            var tableClient = CreateTableClient();
            var tableReference = tableClient.GetTableReference(tableName);
            var gameTable = tableReference;

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

        public async Task AddPlayerToGameAsync(string gameId, string username)
        {
            try
            {
                var table = await GetPlayerTable();
                var insertOperation = TableOperation.Insert(new PlayerEntity() { PartitionKey = gameId, Username = username });
                await table.ExecuteAsync(insertOperation);
            }
            catch (Exception ex)
            {
                Trace.TraceWarning("user was already added to database");
            }
        }

        private async Task<CloudTable> GetPlayerTable()
        {
            return await GetTable("player");
        }

        public async Task<GameEntity> GetGame(string gameId)
        {
            var retrieveGameOperation = TableOperation.Retrieve<GameEntity>(gameId, gameId);
            var table = await GetTable(GameTableName);
            var game = await table.ExecuteAsync(retrieveGameOperation);
            return (GameEntity)game.Result;
        }

        public async Task SetAnswer(string gameId, AnswerEnum answer, StringValues username, int questionIndex)
        {
            var table = await GetTable("answer");
            var insertOperation = TableOperation.InsertOrReplace(new AnswerEntity()
            {
                PartitionKey = gameId,
                RowKey = $"{questionIndex}_{username}",
                Username = username,
                QuestionIndex = questionIndex,
                Answer = (byte)answer,
                GameId = gameId
            });

            await table.ExecuteAsync(insertOperation);
        }

        public async Task SetCouplesAnswer(string gameId, AnswerEnum answer, int questionIndex)
        {
            await this.SetAnswer(gameId, answer, "couple", questionIndex);
        }

        public async Task<Dictionary<string, int>> EvaluateScore(string gameId)
        {
            // get all answers for a game Id
            var answerTable = await GetAnswerTable();
            var query = new TableQuery<AnswerEntity>().Where(TableQuery.GenerateFilterCondition(Partitionkey, QueryComparisons.Equal, gameId));
            var answersCurrentGame = answerTable.ExecuteQuery(query);

            ScoreCalculator scoreCalculator = new ScoreCalculator(answersCurrentGame);
            var resultScore = scoreCalculator.DoEvaluateScore();

            var playerTable = await GetPlayerTable();
            // insert or replace score
            if (resultScore.Count > 0)
            {
                var tableBatchOperation = new TableBatchOperation();

                foreach (KeyValuePair<string, int> scoreKeyValuePair in resultScore)
                {
                    tableBatchOperation.Add(TableOperation.InsertOrReplace(new PlayerEntity()
                    {
                        GameId = gameId,
                        Username = scoreKeyValuePair.Key,
                        Score = scoreKeyValuePair.Value,
                    }));
                }

                await playerTable.ExecuteBatchAsync(tableBatchOperation);
            }

            // read out player table
            var getAllPlayerOperation = new TableQuery<PlayerEntity>().Where(TableQuery.GenerateFilterCondition(Partitionkey, QueryComparisons.Equal, gameId));
            var tableContent = playerTable.ExecuteQuery(getAllPlayerOperation);
            return tableContent.ToDictionary(x=> x.Username, y=> y.Score);
        }

        private async Task<CloudTable> GetAnswerTable()
        {
            return await GetTable("answer");
        }
    }
}
