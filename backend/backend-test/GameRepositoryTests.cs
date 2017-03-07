namespace WeddingQuiz.Test
{
    using System.Threading.Tasks;
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
            var createdGame = gameRepository.CreateGame().Result;
            var actualGame =  gameRepository.GetGame(createdGame.GameId).Result;
            actualGame.GameId.Should().BeEquivalentTo(createdGame.GameId);
        }

        [Fact]
        public async Task When_a_user_joins_a_game_this_works()
        {
            var createdGame = gameRepository.CreateGame().Result;
            await gameRepository.AddPlayerToGameAsync(createdGame.GameId, "test_user");
        }

        [Fact]
        public async Task When_a_user_joins_a_game_twice_done_throw_exception()
        {
            var createdGame = gameRepository.CreateGame().Result;
            await gameRepository.AddPlayerToGameAsync(createdGame.GameId, "test_user");
            await gameRepository.AddPlayerToGameAsync(createdGame.GameId, "test_user");
        }

    }
}