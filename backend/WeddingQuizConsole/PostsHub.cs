namespace WeddingQuizConsole
{
    using System.Diagnostics;
    using System.Threading.Tasks;
    using Microsoft.AspNet.SignalR;

    public class PostsHub : Hub
    {
        public override Task OnConnected()
        {
                // update playerlist on all clients
            return base.OnConnected();
        }

        public override Task OnDisconnected(bool stopCalled)
        {
            // update playerlist on all clients

            return base.OnDisconnected(stopCalled);
        }


        public void PlayerUpdate()
        {
            
        }

        public void SetName(string name)
        {
            Debug.WriteLine($"Client connected with connection id: {this.Context.ConnectionId}");
            Clients.All.broadcastMessage(name);
        }


    }
}