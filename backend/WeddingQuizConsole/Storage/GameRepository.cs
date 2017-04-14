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
                var table = await GetTable("player");
                var insertOperation = TableOperation.Insert(new PlayerEntity() { PartitionKey = gameId, Username = username });
                await table.ExecuteAsync(insertOperation);
            }
            catch (Exception ex)
            {
                Trace.TraceWarning("user was already added to database");
            }
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
                Answer = answer,
                GameId = gameId
            });

            await table.ExecuteAsync(insertOperation);
        }

        public async Task SetCouplesAnswer(string gameId, AnswerEnum answer, int questionIndex)
        {
            await this.SetAnswer(gameId, answer, "couple", questionIndex);
        }

        public async Task<Dictionary<string,int>>  EvaluateScore(string createdGameGameId)
        {
            // get all answers for a game Id
            var table = await GetTable("answer");
            var query = new TableQuery<AnswerEntity>().Where(TableQuery.GenerateFilterCondition("PartitionKey", QueryComparisons.Equal, createdGameGameId));
            var answers = table.ExecuteQuery(query);

            Dictionary<string, int> resultScore = new Dictionary<string, int>();
            // foreach couple answer -> find matching user answers and increase score entity
            var couplesAnswers = answers.Where(x => x.Username == "couple").OrderBy(x => x.QuestionIndex);

            foreach (var couplesAnswer in couplesAnswers)
            {
                var answerWithCorrectUserAnswer = answers.Where(x =>
                    x.QuestionIndex == couplesAnswer.QuestionIndex
                    && x.Username != "couple"
                    && x.Answer == couplesAnswer.Answer);
                    

                foreach (AnswerEntity answer in answerWithCorrectUserAnswer)
                {
                    resultScore[answer.Username] = 1;
                }
            }

            // insert or replace score
            // todo

            return resultScore;
        }
    }

    public class AnswerEntity : TableEntity
    {
        public int QuestionIndex { get; set; }
        public string Username { get; set; }

        public string GameId { get; set; }

        public AnswerEnum Answer { get; set; }
    }
}
