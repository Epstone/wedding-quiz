namespace WeddingQuiz.Test
{
    using System;
    using System.Threading.Tasks;
    using FluentAssertions;
    using MrAndMrs.App3.Controllers;
    using MrAndMrs.App3.Entities;
    using MrAndMrs.App3.Storage;
    using Xunit;

    public class GameControllerTests
    {
        public GameControllerTests()
        {
            gameController = new GameController(new GameRepository("UseDevelopmentStorage=true"));
        }

        private readonly GameController gameController;

        [Fact]
        public async Task Given_a_game_is_created_Then_it_is_ok_to_connect_as_player()
        {
            //setup
            var game = await CreateGame();

            //act
            var joinGameModel = new JoinGameModel
            {
                Username = "Paul",
                GameId = game.GameId
            };

            var joinGameResult = await JoinGame(joinGameModel);
            Assert.Equal("allow_connection", joinGameResult.Result);
        }

        [Fact]
        public async Task Given_a_player_connects_twice_to_the_same_game_Then_this_is_ok()
        {
            var game = await CreateGame();
            var joinGameModel = new JoinGameModel
            {
                Username = "Paul",
                GameId = game.GameId,
                AccountKey = Guid.NewGuid().ToString()
            };

            // act
            await JoinGame(joinGameModel);
            var secondJoinGameResult = await JoinGame(joinGameModel);

            //assert
            Assert.Equal("allow_connection", secondJoinGameResult.Result);
        }

        private async Task<JoinGameResult> JoinGame(JoinGameModel joinGameModel)
        {
            var joinGameResultResponse = await gameController.Join(joinGameModel);

            //assert
            var joinGameResult = joinGameResultResponse.Value as JoinGameResult;
            return joinGameResult;
        }

        [Fact]
        public async Task Given_a_player_connects_twice_When_using_a_different_account_key_Then_this_is_not_ok()
        {
            var game = await CreateGame();

            // act
            var joinGameModel_1 = new JoinGameModel
            {
                Username = "Paul",
                GameId = game.GameId,
                AccountKey = Guid.NewGuid().ToString()
            };

            var joinGameModel_2 = new JoinGameModel
            {
                Username = "Paul",
                GameId = game.GameId,
                AccountKey = Guid.NewGuid().ToString()
            };

            var firstJoinResult = await JoinGame(joinGameModel_1);
            var secondJoinResult = await JoinGame(joinGameModel_2);

            //assert
            Assert.Equal("allow_connection", firstJoinResult.Result);
            Assert.Equal("username_taken", secondJoinResult.Result);
        }

        private async Task<GameEntity> CreateGame()
        {
            var response = await gameController.Create();
            var createdGame = response.Value as GameEntity;
            createdGame.GameId.Should().NotBeNullOrEmpty();
            return createdGame;
        }
    }
}