namespace WeddingQuiz.Test
{
    using System.Threading.Tasks;
    using FluentAssertions;
    using WeddingQuizConsole.Entities;
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
            var actualGame = gameRepository.GetGame(createdGame.GameId).Result;
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

        [Fact]
        public async Task When_a_user_gives_the_correct_answer_Then_his_Score_is_increased()
        {
            var createdGame = gameRepository.CreateGame().Result;
            await gameRepository.SetAnswer(createdGame.GameId, AnswerEnum.Mr, "paul", 0);
            await gameRepository.SetCouplesAnswer(createdGame.GameId, AnswerEnum.Mr, 0);
            var result =  await gameRepository.EvaluateScore(createdGame.GameId);

            Assert.Equal(1, result["paul"]);
        }

        [Fact]
        public async Task When_a_user_gives_the_correct_answer_twice_Then_his_score_is_2()
        {
            var questionIndex_1 = 0;
            var questionIndex_2 = 1;
            var createdGame = gameRepository.CreateGame().Result;
            await gameRepository.SetAnswer(createdGame.GameId, AnswerEnum.Mr, "paul", questionIndex_1);
            await gameRepository.SetCouplesAnswer(createdGame.GameId, AnswerEnum.Mr, questionIndex_1);

            await gameRepository.SetAnswer(createdGame.GameId, AnswerEnum.Mrs, "paul", questionIndex_2);
            await gameRepository.SetCouplesAnswer(createdGame.GameId, AnswerEnum.Mrs, questionIndex_2);
            var result = await gameRepository.EvaluateScore(createdGame.GameId);

            Assert.Equal(2, result["paul"]);
        }

        [Fact]
        public async Task When_a_user_gives_wrong_answer_Then_it_is_not_scored()
        {
            var questionIndex_1 = 0;
            var createdGame = gameRepository.CreateGame().Result;
            await gameRepository.SetAnswer(createdGame.GameId, AnswerEnum.Mr, "paul", questionIndex_1);
            await gameRepository.SetCouplesAnswer(createdGame.GameId, AnswerEnum.Mrs, questionIndex_1);

            var result = await gameRepository.EvaluateScore(createdGame.GameId);

            Assert.Equal(0, result["paul"]);
        }

        [Fact]
        public async Task When_a_user_gives_wrong_answer_after_correct_Then_score_is_1()
        {
            var questionIndex_1 = 0;
            var questionIndex_2 = 1;
            var createdGame = gameRepository.CreateGame().Result;
            await gameRepository.SetAnswer(createdGame.GameId, AnswerEnum.Mrs, "paul", questionIndex_1);
            await gameRepository.SetCouplesAnswer(createdGame.GameId, AnswerEnum.Mrs, questionIndex_1);

            await gameRepository.SetAnswer(createdGame.GameId, AnswerEnum.Mr, "paul", questionIndex_2);
            await gameRepository.SetCouplesAnswer(createdGame.GameId, AnswerEnum.Mrs, questionIndex_2);

            var result = await gameRepository.EvaluateScore(createdGame.GameId);

            Assert.Equal(1, result["paul"]);
        }

    }
}