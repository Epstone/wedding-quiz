﻿namespace WeddingQuizConsole
{
    using System.Diagnostics;
    using System.Linq;
    using System.Threading.Tasks;
    using BasicChat;
    using Microsoft.AspNetCore.SignalR;
    using Microsoft.AspNetCore.SignalR.Hubs;
    using Microsoft.Extensions.Primitives;
    using Storage;

    [HubName("postshub")]
    public class PostsHub : Hub
    {
        internal static readonly ConnectionMapping<string> _connections =
            new ConnectionMapping<string>();

        private readonly int questionNo = 0;

        public override Task OnConnected()
        {
            string username = UsernameFromQueryString();
            _connections.Add(username, Context.ConnectionId);
            Debug.WriteLine($"User {username} has connected with connectionId: {Context.ConnectionId}");
            return base.OnConnected();
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

        public void StartGame(string gameId)
        {
            string connectionString = "UseDevelopmentStorage=true";
            var gameRepository = new GameRepository(connectionString);

            var game = gameRepository.GetGame(gameId).Result;
            Clients.All.gameStarted(game);
        }

        public void Subscribe(string name)
        {
            Clients.All.broadcastMessage(name, $"new connection from {Context.ConnectionId}");
            Clients.All.broadcastMessage(name, "tests");
        }

        public void ShowNextQuestion()
        {
            Clients.All.questionChangeRequested(new {questionNo});
        }

        public void SelectAnswer(string answer)
        {
            Clients.All.answerSelected(new {user = UsernameFromQueryString(), answer = answer});
        }

        private StringValues UsernameFromQueryString()
        {
            return Context.QueryString.FirstOrDefault(x => x.Key == "username").Value;
        }
    }
}