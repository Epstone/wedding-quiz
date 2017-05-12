namespace MrAndMrs.App3
{
    using System.Diagnostics;
    using System.Linq;
    using System.Threading.Tasks;
    using Entities;
    using Microsoft.AspNetCore.SignalR;
    using Microsoft.AspNetCore.SignalR.Hubs;
    using Microsoft.Extensions.Primitives;
    using Storage;

    [HubName("postshub")]
    public class PostsHub : Hub
    {
        private readonly GameRepository gameRepository;
        //internal static readonly ConnectionMapping<string> _connections =
        //    new ConnectionMapping<string>();

        private readonly int questionNo = 0;
        //private readonly GameRepository gameRepository = new GameRepository(Constants.ConnectionString);

        public PostsHub(GameRepository gameRepository)
        {
            this.gameRepository = gameRepository;
        }

        public override async Task OnConnected()
        {
            string username = UsernameFromQueryString();
            //_connections.Add(username, Context.ConnectionId);
            var gameId = GameIdFromQueryString();
            Debug.WriteLine($"User {username} has connected with connectionId: {Context.ConnectionId}");

            await Groups.Add(Context.ConnectionId, gameId);
            await GameUpdated(gameId);

            await base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            string name = UsernameFromQueryString();
            //_connections.Remove(name, Context.ConnectionId);
            return base.OnDisconnected(stopCalled);
        }


        public override Task OnReconnected()
        {
            string name = UsernameFromQueryString();
            //if (!_connections.GetConnections(name).Contains(Context.ConnectionId))
            //{
            //    Debug.WriteLine($"user {name} has reconnected with connectionId: {Context.ConnectionId}");
            //    _connections.Add(name, Context.ConnectionId);
            //}

            return base.OnReconnected();
        }

        public async Task UpdatePlayerList()
        {
            var gameId = GameIdFromQueryString();
            var players = await gameRepository.GetPlayers(gameId);
            Clients.Group(gameId).playerListUpdated(players.Select(x=>x.Username));
        }

        public async Task StartGame(string gameId)
        {
            var game = await gameRepository.StartGame(gameId);
            Clients.Group(gameId).gameStarted(game);
        }

        public void Subscribe(string name)
        {
            Clients.All.broadcastMessage(name, $"new connection from {Context.ConnectionId}");
            Clients.All.broadcastMessage(name, "tests");
        }

        public async Task ShowNextQuestion(string gameId)
        {
            var questionIndex = await gameRepository.IncreaseQuestionIndex(gameId);

            await GameUpdated(gameId);
            Clients.Group(gameId).questionChangeRequested(questionIndex);

            await UpdateHighscore(gameId);
        }

        /// <summary>
        /// Is called when one player wants to receive the current highscore.
        /// </summary>
        public async Task GetHighscore(string gameId)
        {
            var highscore = await gameRepository.GetHighscore(gameId);
            Clients.Caller.highscoreUpdated(highscore);
        }

        private async Task UpdateHighscore(string gameId)
        {
            await gameRepository.EvaluateScore(gameId);
            var highscore = await gameRepository.GetHighscore(gameId);
            Clients.Group(gameId).highscoreUpdated(highscore);
        }

        public async Task SelectAnswer(int answer, int questionIndex)
        {
            var username = UsernameFromQueryString();
            var gameId = GameIdFromQueryString();

            if (username == "moderator")
            {
                await gameRepository.SetCouplesAnswer(gameId, (AnswerEnum) answer, questionIndex);
            }
            else
            {
                await gameRepository.SetAnswer(gameId, (AnswerEnum)answer, username, questionIndex);

            }

            CurrentAnswerStatistic answers = await gameRepository.GetAnswerStatistic(gameId, questionIndex);

            Clients.OthersInGroup(gameId).answerSelected(answers);
        }

        public async Task EndGame(string gameId)
        {
            var game = await gameRepository.GetGame(gameId);
            game.SetState(GameState.Finished);
            await gameRepository.SaveGame(game);

            await UpdateHighscore(gameId);

            Clients.Group(gameId).gameEnded();
            PublishGameUpdate(gameId,game);
        }

        public async Task UpdateQuestions(string gameId, string[] questions)
        {
            var game = await gameRepository.GetGame(gameId);
            game.Questions = questions.ToList();
            await gameRepository.SaveGame(game);

            PublishGameUpdate(gameId, game);
        }

        private async Task GameUpdated(string gameId)
        {
            var gameEntity = await gameRepository.GetGame(gameId);
            PublishGameUpdate(gameId, gameEntity);
        }

        private void PublishGameUpdate(string gameId, GameEntity gameEntity)
        {
            Clients.Group(gameId).GameUpdated(gameEntity);
        }

        private StringValues UsernameFromQueryString()
        {
            return Context.QueryString.FirstOrDefault(x => x.Key == "username").Value;
        }

        private string GameIdFromQueryString()
        {
            return Context.QueryString.FirstOrDefault(x => x.Key == "gameId").Value;
        }
    }
}