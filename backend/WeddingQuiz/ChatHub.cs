namespace SignalRChat
{
    using System.Threading.Tasks;
    using Microsoft.AspNetCore.SignalR;

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
    }
}