namespace WeddingQuiz.Test
{
    using FluentAssertions;
    using OpenQA.Selenium;
    using Xunit;

    public class UiTest : IClassFixture<UiTestFixture>
    {
        public UiTest(UiTestFixture fixture)
        {
            this.fixture = fixture;
        }

        private readonly UiTestFixture fixture;

        [Fact]
        public void FullTestModeratorOnly()
        {
            var driver = fixture.CreateOrGetFirstDriver();

            var gameDetails = StartNewGame(driver);
            var questionPage = new QuestionPage(driver);

            questionPage.AnswerAllQuestions(gameDetails);

            //end game
            questionPage.EndGameButton.WaitForElementToBeDisplayed(driver);
            questionPage.EndGameButton.Click();

            // highscore is shown
            var highScore = new HighscorePage(driver);
            highScore.Heading.WaitForTextToContain("Übersicht", driver);
        }


        [Fact]
        public void Given_a_started_game_a_new_user_can_join_and_sees_question()
        {
            var moderatorDriver = fixture.CreateOrGetFirstDriver();

            var gameDetails = StartNewGame(moderatorDriver);

            HandleFirstQuestion(moderatorDriver);

            var playerDriver = fixture.CreateOrGetSecondDriver();
            JoinGameAsPlayer(playerDriver, gameDetails);

            var playerQuestionPage = new QuestionPage(playerDriver);
            playerQuestionPage.CurrentQuestionNumber.WaitForTextToContain("2", playerDriver);
        }

        [Fact]
        public void Given_a_not_started_game_player_gets_into_lobby()
        {
            var moderatorDriver = fixture.CreateOrGetFirstDriver();

            var homePage  = new HomePage(moderatorDriver);
            homePage.CreateGameButton.Click();

            var createGamePage = new CreateGamePage(moderatorDriver);
            var gameDetails = createGamePage.CreateGame();

            var playerDriver = fixture.CreateOrGetSecondDriver();
            JoinGameAsPlayer(playerDriver, gameDetails);

            var lobbyPage = new LobbyPage(playerDriver);
            lobbyPage.Heading.WaitForTextToContain("(Lobby)", playerDriver);
        }

        [Fact]
        public void Given_a_finished_game_When_a_user_joins_Then_he_is_routed_to_the_highscore()
        {
            var moderatorDriver = fixture.CreateOrGetFirstDriver();

            new HomePage(moderatorDriver).CreateGameButton.Click();
            var createGamePage = new CreateGamePage(moderatorDriver);
            var gameDetails = createGamePage.CreateGame();
            createGamePage.StartGameButton.Click();
            
            var questionPage = new QuestionPage(moderatorDriver);
            questionPage.AnswerAllQuestions(gameDetails);
            questionPage.EndGameButton.Click();

            var playerDriver = fixture.CreateOrGetSecondDriver();
            JoinGameAsPlayer(playerDriver, gameDetails);

            var highscorePage = new HighscorePage(playerDriver);
            highscorePage.Heading.WaitForTextToContain("Übersicht", playerDriver);
        }


        private static void HandleFirstQuestion(IWebDriver moderatorDriver)
        {
            var moderatorQuestionPage = new QuestionPage(moderatorDriver);

            moderatorQuestionPage.CurrentQuestionNumber.WaitForTextToContain("1", moderatorDriver);
            moderatorQuestionPage.MrButton.Click();
            moderatorQuestionPage.NextQuestionButton.Click();

            moderatorQuestionPage.CurrentQuestionNumber.WaitForTextToContain("2", moderatorDriver);
        }

        private static void JoinGameAsPlayer(IWebDriver playerDriver, NewGameDetails gameDetails)
        {
            var homePage = new HomePage(playerDriver);
            homePage.JoinGameButton.Click();

            var joinGamePage = new JoinGamePage(playerDriver);
            joinGamePage.UsernameTextbox.SendKeys("Hans Müller");
            joinGamePage.GameIdTextbox.SendKeys(gameDetails.GameId);
            joinGamePage.JoinGameButton.Click();
        }

        private NewGameDetails StartNewGame(IWebDriver driver)
        {
            var homePage = new HomePage(driver);
            homePage.CreateGameButton.Click();

            var createGamePage = new CreateGamePage(driver);
            var gameDetails = createGamePage.CreateGame();

            createGamePage.StartGameButton.Click();
            return gameDetails;
        }
    }
}