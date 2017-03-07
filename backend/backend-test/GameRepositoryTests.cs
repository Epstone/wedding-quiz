namespace WeddingQuiz.Test
{
    using FluentAssertions;
    using WeddingQuizConsole.Storage;
    using Xunit;
    using Xunit.Abstractions;

    public class GameRepositoryTests
    {
        private ITestOutputHelper testOutputHelper;
        private GameRepository gameRepository;


        public GameRepositoryTests(ITestOutputHelper output)
        {
            testOutputHelper = output;
            string connectionString = "UseDevelopmentStorage=true";
            gameRepository = new GameRepository(connectionString);
        }

        [Fact]
        public void When__user_creates_game_verify_one_game_is_stored()
        {
            
            var actualGame = gameRepository.CreateGame();
            actualGame.Should().NotBeNull();
        }

        [Fact]
        public void When_game_is_created_game_exists()
        {
            var actualGame = gameRepository.CreateGame();
            gameRepository.IsGameExisting(actualGame.Result.GameId);
        }



    }
}