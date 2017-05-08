namespace WeddingQuizConsole.Storage
{
    using System.Collections.Generic;
    using System.Globalization;
    using System.Linq;
    using System.Threading.Tasks;
    using Entities;
    using Microsoft.Extensions.Primitives;
    using Microsoft.WindowsAzure.Storage;
    using Microsoft.WindowsAzure.Storage.Table;
    using Models;

    public class GameRepository
    {
        private const string CoupleName = "couple";
        private static readonly string GameTableName = "game";
        private static readonly string Partitionkey = "PartitionKey";
        private readonly string connectionString;

        public GameRepository(string connectionString)
        {
            this.connectionString = connectionString;
        }

        public async Task<PlayerEntity> GetPlayer(string gameId, string contentUsername)
        {
            var table = await GetPlayerTable();
            var query = new TableQuery<PlayerEntity>().Where(TableQuery.GenerateFilterCondition(Partitionkey, QueryComparisons.Equal, gameId));
            var players = table.ExecuteQuery(query);

            var player =
                players.FirstOrDefault(x => x.Username.ToLower(CultureInfo.InvariantCulture) == contentUsername.ToLower(CultureInfo.InvariantCulture));

            return player;
        }

        public async Task AddPlayerToGameAsync(string gameId, string username, string accountKey, int score = 0)
        {
            var table = await GetPlayerTable();

            var insertOperation =
                TableOperation.Insert(new PlayerEntity {PartitionKey = gameId, Username = username, AccountKey = accountKey, Score = score});

            await table.ExecuteAsync(insertOperation);
        }

        public async Task<GameEntity> GetGame(string gameId)
        {
            var retrieveGameOperation = TableOperation.Retrieve<GameEntity>(gameId, gameId);
            var table = await GetTable(GameTableName);
            var game = await table.ExecuteAsync(retrieveGameOperation);
            return (GameEntity) game.Result;
        }

        public async Task SetAnswer(string gameId, AnswerEnum answer, StringValues username, int questionIndex)
        {
            var table = await GetTable("answer");
            var insertOperation = TableOperation.InsertOrReplace(new AnswerEntity
            {
                PartitionKey = gameId,
                RowKey = $"{questionIndex}_{username}",
                Username = username,
                QuestionIndex = questionIndex,
                Answer = (byte) answer,
                GameId = gameId
            });

            await table.ExecuteAsync(insertOperation);
        }

        public async Task SetCouplesAnswer(string gameId, AnswerEnum answer, int questionIndex)
        {
            await SetAnswer(gameId, answer, CoupleName, questionIndex);
        }

        public async Task<Dictionary<string, int>> EvaluateScore(string gameId)
        {
            var answersCurrentGame = await GetAnswersForGame(gameId);

            var scoreCalculator = new ScoreCalculator(answersCurrentGame);
            var resultScore = scoreCalculator.EvaluateScore();

            await UpdatePlayerScore(gameId, resultScore);

            var players = await GetPlayers(gameId);
            return players.ToDictionary(x => x.Username, y => y.Score);
        }

        public async Task<IEnumerable<PlayerEntity>> GetPlayers(string gameId)
        {
            var playerTable = await GetPlayerTable();
            // read out player table
            var getAllPlayerOperation =
                new TableQuery<PlayerEntity>().Where(TableQuery.GenerateFilterCondition(Partitionkey, QueryComparisons.Equal, gameId));
            var tableContent = playerTable.ExecuteQuery(getAllPlayerOperation);
            return tableContent;
        }

        public async Task<GameEntity> StartGame(string gameId)
        {
            var game = await GetGame(gameId);
            game.SetState(GameState.QuestionsAsked);
            await SaveGame(game);
            return game;
        }

        public async Task<int> IncreaseQuestionIndex(string asdfg)
        {
            var game = await GetGame(asdfg);
            game.CurrentQuestionIndex = game.CurrentQuestionIndex + 1;
            await SaveGame(game);
            return game.CurrentQuestionIndex;
        }


        public async Task<HighscoreModel> GetHighscore(string gameId)
        {
            var players = await GetPlayers(gameId);
            var results = from p in players
                group p.Username by p.Score
                into g
                select new HighscoreEntry
                {
                    Score = g.Key,
                    Names = g.OrderBy(name => name).ToArray()
                };

            var firstThree = results.OrderByDescending(group => group.Score).Take(3).ToArray();
            return new HighscoreModel
            {
                Entries = firstThree.ToArray()
            };
        }

        public async Task<CurrentAnswerStatistic> GetAnswerStatistic(string gameId, int questionIndex)
        {
            var answers = await GetAnswersForGame(gameId);
            var answersCurrentQuestionWithoutCouple =
                answers.Where(answer => answer.QuestionIndex == questionIndex && answer.Username != CoupleName).ToList();

            var result = new CurrentAnswerStatistic
            {
                Mr = answersCurrentQuestionWithoutCouple.Count(x => x.Answer == (int) AnswerEnum.Mr),
                Mrs = answersCurrentQuestionWithoutCouple.Count(x => x.Answer == (int) AnswerEnum.Mrs),
                Both = answersCurrentQuestionWithoutCouple.Count(x => x.Answer == (int) AnswerEnum.Both)
            };

            return result;
        }

        internal async Task<GameEntity> CreateGame()
        {
            var game = new GameEntity();
            game.Questions = new List<string>
            {
                "Wer geht am Sonntag zum Bäcker?",
                "Wer wäscht ab?",
                "Wer räumt auf?"
                //"Wer macht die Betten?",
                //"Wer telefoniert häufiger mit Mutti?",
                //"Wer treibt mehr Sport?",
                //"Wer hat den besser durchtrainierten Körper?",
                //"wer benötigt am Bad immer am längsten?",
                //"Wer ist pünktlicher?",
                //"Wer kommt immer zu spät?",
                //"Wer ist lauter beim Sex?",
                //"Wer hat mehr Lust auf Sex?",
                //"Wer kann besser verlieren?",
                //"Wer kann besser gewinnen?"
            };

            game.SetState(GameState.Lobby);

            await SaveGame(game);

            return game;
        }

        internal async Task SaveGame(GameEntity game)
        {
            var gameTable = await GetTable(GameTableName);
            var insertOperation = TableOperation.InsertOrMerge(game);
            await gameTable.ExecuteAsync(insertOperation);
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

        private async Task<CloudTable> GetPlayerTable()
        {
            return await GetTable("player");
        }

        private async Task<IEnumerable<AnswerEntity>> GetAnswersForGame(string gameId)
        {
            var answerTable = await GetAnswerTable();
            var query = new TableQuery<AnswerEntity>().Where(TableQuery.GenerateFilterCondition(Partitionkey, QueryComparisons.Equal, gameId));
            var answersCurrentGame = answerTable.ExecuteQuery(query);
            return answersCurrentGame;
        }

        private async Task UpdatePlayerScore(string gameId, Dictionary<string, int> resultScore)
        {
            if (resultScore.Count > 0)
            {
                var playerTableClient = await GetPlayerTable();
                var updateScoreBatchOperation = new TableBatchOperation();

                foreach (var scoreKeyValuePair in resultScore)
                    updateScoreBatchOperation.Add(TableOperation.InsertOrReplace(new PlayerEntity
                    {
                        GameId = gameId,
                        Username = scoreKeyValuePair.Key,
                        Score = scoreKeyValuePair.Value
                    }));

                await playerTableClient.ExecuteBatchAsync(updateScoreBatchOperation);
            }
        }

        private async Task<CloudTable> GetAnswerTable()
        {
            return await GetTable("answer");
        }
    }

    public enum GameState
    {
        Lobby = 0,
        QuestionsAsked = 1,
        Finished = 2
    }
}