namespace WeddingQuizConsole
{
    using System.Diagnostics;
    using System.Linq;
    using System.Threading.Tasks;
    using BasicChat;
    using Microsoft.AspNetCore.SignalR;
    using Microsoft.AspNetCore.SignalR.Hubs;

    [HubName("postshub")]
    public class PostsHub : Hub
    {
        
        internal static readonly ConnectionMapping<string> _connections =
            new ConnectionMapping<string>();

        public override Task OnConnected()
        {

            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            string name = Context.User.Identity.Name;
            _connections.Remove(name, Context.ConnectionId);
            return base.OnDisconnected(stopCalled);
        }

        public override Task OnReconnected()
        {
            string name = Context.User.Identity.Name;
            if (!_connections.GetConnections(name).Contains(Context.ConnectionId))
            {
                _connections.Add(name, Context.ConnectionId);
            }

            return base.OnReconnected();
        }

        public void PlayerUpdate()
        {
            
        }

        public void Subscribe(string name)
        {
            _connections.Add(name, Context.ConnectionId);
            Clients.All.broadcastMessage(name, $"new connection from {Context.ConnectionId}");

            Clients.All.broadcastMessage(name,"tests");
        }


    }
}