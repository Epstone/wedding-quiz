namespace WeddingQuizConsole
{
    using System;
    using System.Diagnostics;
    using System.Linq;
    using System.Threading.Tasks;
    using BasicChat;
    using Entities;
    using Microsoft.AspNetCore.SignalR;
    using Microsoft.AspNetCore.SignalR.Hubs;
    using Microsoft.Extensions.Primitives;
    using Models;
    using Storage;

    [HubName("postshub")]
    public class PostsHub : Hub
    {
        GameRepository gameRepository = new GameRepository(Constants.ConnectionString);

        internal static readonly ConnectionMapping<string> _connections =
            new ConnectionMapping<string>();

        private readonly int questionNo = 0;

        public override async Task OnConnected()
        {
            string username = UsernameFromQueryString();
            _connections.Add(username, Context.ConnectionId);
            string gameId = GameIdFromQueryString();
            Debug.WriteLine($"User {username} has connected with connectionId: {Context.ConnectionId}");

            await Groups.Add(Context.ConnectionId, gameId);
            await GameUpdated(gameId);

            await base.OnConnected();
        }

        private async Task GameUpdated(string gameId)
        {
            Clients.Group(gameId).GameUpdated(await gameRepository.GetGame(gameId));
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            string name = UsernameFromQueryString();
            _connections.Remove(name, Context.ConnectionId);
            return base.OnDisconnected(stopCalled);
        }

        

        public override Task OnReconnected()
        {
            string name = UsernameFromQueryString();
            if (!_connections.GetConnections(name).Contains(Context.ConnectionId))
            {
                Debug.WriteLine($"user {name} has reconnected with connectionId: {Context.ConnectionId}");
                _connections.Add(name, Context.ConnectionId);
            }

            return base.OnReconnected();
        }

        public void UpdatePlayerList()
        {
            Clients.All.playerListUpdated(_connections.GetKeys());
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
            await this.GameUpdated(gameId);
            Clients.Group(gameId).questionChangeRequested(questionIndex);
            HighscoreModel highscore=  await gameRepository.GetHighscore(gameId);
            Clients.Group(gameId).highscoreUpdated(highscore);
        }

        public async Task SelectAnswer(int answer, int questionIndex)
        {
            var username = UsernameFromQueryString();
            var gameId = GameIdFromQueryString();

            await gameRepository.SetAnswer(gameId, (AnswerEnum) answer, username, questionIndex);

            Clients.Group(gameId).answerSelected(new {username});
        }

        public async Task EndGame(string gameId)
        {
            var game = await gameRepository.GetGame(gameId);
            game.SetState(GameState.Finished);
            await gameRepository.SaveGame(game);
            Clients.Group(gameId).gameEnded();
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

    public class HighscoreModel
    {
        public HighscoreEntry[] Entries;
    }

    public class HighscoreEntry
    {
        public string[] Names { get; set; }
        public int Score { get; set; }
    }

    internal class Constants
    {
        public static readonly string ConnectionString = "UseDevelopmentStorage=true";
    }
}