namespace WeddingQuiz.Test
{
    using System;
    using System.Dynamic;
    using System.Threading.Tasks;
    using FluentAssertions;
    using Microsoft.AspNetCore.SignalR.Hubs;
    using Moq;
    using WeddingQuizConsole;
    using WeddingQuizConsole.Controllers;
    using WeddingQuizConsole.Models;
    using Xunit;

    public class GameHubTests
    {
        public GameHubTests()
        {
            gameController = new GameController();
        }

        private readonly GameController gameController;


        [Fact]
        public async Task When_a_user_selects_the_answer_others_in_group_are_notified_with_all_recent_answers_to_that_question()
        {
            bool sendCalled = false;
            var hub = new PostsHub();
            var mockClients = new Mock<IHubCallerConnectionContext<dynamic>>();
            hub.Clients = mockClients.Object;
            dynamic all = new ExpandoObject();
            all.answerSelected = new Action<string>((name) => {
                sendCalled = true;
            });
            mockClients.Setup(m => m.All).Returns((ExpandoObject)all);
            await  hub.SelectAnswer(1,0);
            Assert.True(sendCalled);
        }
    }
}