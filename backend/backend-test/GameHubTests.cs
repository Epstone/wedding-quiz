namespace WeddingQuiz.Test
{
    using System;
    using System.Threading.Tasks;
    using FluentAssertions;
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

    }
}