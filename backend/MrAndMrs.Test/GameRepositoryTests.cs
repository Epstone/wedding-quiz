namespace WeddingQuiz.Test
{
    using System;
    using System.Linq;
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
        public async Task When_a_game_is_started_the_game_state_changes()
        {
            var actualGame = await gameRepository.CreateGame();
            await gameRepository.StartGame(actualGame.GameId);

            actualGame = await gameRepository.GetGame(actualGame.GameId);
            actualGame.GetState().Should().Be(GameState.QuestionsAsked);
        }

        [Fact]
        public async Task When_the_question_index_shall_be_increased_the_result_is_correct()
        {
            var actualGame = await gameRepository.CreateGame();
            await gameRepository.StartGame(actualGame.GameId);

            await gameRepository.IncreaseQuestionIndex(actualGame.GameId);
            await gameRepository.IncreaseQuestionIndex(actualGame.GameId);

            actualGame = await gameRepository.GetGame(actualGame.GameId);
            actualGame.CurrentQuestionIndex.Should().Be(2);
        }

        [Fact]
        public async Task When_user_creates_game_verify_one_game_is_stored_and_not_started()
        {
            var actualGame = await gameRepository.CreateGame();
            actualGame.Should().NotBeNull();
            actualGame.GetState().Should().Be(GameState.Lobby);
        }

        [Fact]
        public void When_game_is_created_game_exists()
        {
            var createdGame = gameRepository.CreateGame().Result;
            var actualGame = gameRepository.GetGame(createdGame.GameId).Result;
            actualGame.GameId.Should().BeEquivalentTo(createdGame.GameId);
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
        public async Task When_a_user_gives_an_answer_Then_the_answer_statistic_is_correct()
        {
            var questionIndex_1 = 0;
            var questionIndex_2 = 1;
            var createdGame = gameRepository.CreateGame().Result;
            await gameRepository.SetAnswer(createdGame.GameId, AnswerEnum.Mr, "paul", questionIndex_1);
            await gameRepository.SetCouplesAnswer(createdGame.GameId, AnswerEnum.Mrs, questionIndex_1);

            var statistics = await gameRepository.GetAnswerStatistic(createdGame.GameId, questionIndex_1);
            statistics.Mr.Should().Be(1);
            statistics.Mrs.Should().Be(0);
            statistics.Both.Should().Be(0);

            await gameRepository.SetAnswer(createdGame.GameId, AnswerEnum.Mr, "paul", questionIndex_2);
            await gameRepository.SetCouplesAnswer(createdGame.GameId, AnswerEnum.Mr, questionIndex_2);

            statistics = await gameRepository.GetAnswerStatistic(createdGame.GameId, questionIndex_2);
            statistics.Mr.Should().Be(1);
            statistics.Mrs.Should().Be(0);
            statistics.Both.Should().Be(0);

        }

        [Fact]
        public async Task The_highscore_is_calculated_correctly_with_more_then_3_players()
        {
            var createdGame = gameRepository.CreateGame().Result;
            await gameRepository.AddPlayerToGameAsync(createdGame.GameId, "NotInHighscore", Guid.NewGuid().ToString(), 4);
            await gameRepository.AddPlayerToGameAsync(createdGame.GameId, "Hans", Guid.NewGuid().ToString(), 5);
            await gameRepository.AddPlayerToGameAsync(createdGame.GameId, "Peter", Guid.NewGuid().ToString(), 6);
            await gameRepository.AddPlayerToGameAsync(createdGame.GameId, "Paul", Guid.NewGuid().ToString(), 8);
            await gameRepository.AddPlayerToGameAsync(createdGame.GameId, "Gunter", Guid.NewGuid().ToString(), 8);

            var highscore = await gameRepository.GetHighscore(createdGame.GameId);
            highscore.Entries.Length.Should().Be(3);
            highscore.Entries.First().Names.Should().ContainInOrder("Gunter", "Paul");
            highscore.Entries.First().Score.Should().Be(8);
            highscore.Entries[1].Names.Should().Contain("Peter");
            highscore.Entries[2].Names.Should().Contain("Hans");
            highscore.Entries[2].Score.Should().Be(5);
        }

        [Fact]
        public async Task The_highscore_is_calculated_correctly_with_just_one_group()
        {
            var createdGame = gameRepository.CreateGame().Result;
            await gameRepository.AddPlayerToGameAsync(createdGame.GameId, "Hans", Guid.NewGuid().ToString(), 8);
            await gameRepository.AddPlayerToGameAsync(createdGame.GameId, "Peter", Guid.NewGuid().ToString(), 8);
            await gameRepository.AddPlayerToGameAsync(createdGame.GameId, "Paul", Guid.NewGuid().ToString(), 8);
            await gameRepository.AddPlayerToGameAsync(createdGame.GameId, "Gunter", Guid.NewGuid().ToString(), 8);

            var highscore = await gameRepository.GetHighscore(createdGame.GameId);
            highscore.Entries.Length.Should().Be(1);
            highscore.Entries.First().Names.Should().ContainInOrder("Gunter", "Hans", "Paul", "Peter");
            highscore.Entries.First().Score.Should().Be(8);
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