namespace WeddingQuiz.Test
{
    using FluentAssertions;
    using WeddingQuizConsole.Storage;
    using Xunit;
    using Xunit.Abstractions;

    public class GameRepositoryTests
    {
        private ITestOutputHelper testOutputHelper;


        public GameRepositoryTests(ITestOutputHelper output)
        {
            testOutputHelper = output;
        }

        [Fact]
        public void When__user_creates_game_verify_one_game_is_stored()
        {
            string connectionString = "UseDevelopmentStorage=true";
            GameRepository repository = new GameRepository(connectionString);

            var actualGame = repository.CreateGame();
            actualGame.Should().NotBeNull();
        }



    }
}