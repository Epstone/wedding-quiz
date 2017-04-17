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

            var totalNumberOfQuestions = StartNewGame(driver).TotalNumberOfQuestions;

            var questionPage = new QuestionPage(driver);
            questionPage.TotalQuestionNumber.Text.Should().Be(totalNumberOfQuestions.ToString());

            for (var i = 1; i <= totalNumberOfQuestions; i++)
            {
                questionPage.CurrentQuestionNumber.WaitForTextToBe(i.ToString(), driver);
                questionPage.MrButton.Click();

                if (i < totalNumberOfQuestions)
                    questionPage.NextQuestionButton.Click();
            }

            //end game
            questionPage.EndGameButton.WaitForElementToBeDisplayed(driver);
            questionPage.EndGameButton.Click();

            // highscore is shown
            var highScore = new HighscorePage(driver);
            highScore.Heading.WaitForTextToBe("Übersicht", driver);
        }


        [Fact]
        public void Given_a_started_game_a_new_user_can_join_any_time()
        {
            var moderatorDriver = fixture.CreateOrGetFirstDriver();

            var gameDetails = StartNewGame(moderatorDriver);

            var moderatorQuestionPage = new QuestionPage(moderatorDriver);

            moderatorQuestionPage.CurrentQuestionNumber.WaitForTextToBe("1", moderatorDriver);
            moderatorQuestionPage.MrButton.Click();
            moderatorQuestionPage.NextQuestionButton.Click();

            moderatorQuestionPage.CurrentQuestionNumber.WaitForTextToBe("2", moderatorDriver);

            // create new player and join the game
            var playerDriver = fixture.CreateOrGetSecondDriver();

            var homePage = new HomePage(playerDriver);
            homePage.JoinGameButton.Click();

            var joinGamePage = new JoinGamePage(playerDriver);
            joinGamePage.UsernameTextbox.SendKeys("Hans Müller");
            joinGamePage.GameIdTextbox.SendKeys(gameDetails.GameId);
            joinGamePage.JoinGameButton.Click();

            var playerQuestionPage = new QuestionPage(playerDriver);
            playerQuestionPage.CurrentQuestionNumber.WaitForTextToBe("2", playerDriver);
        }

        private static NewGameDetails StartNewGame(IWebDriver driver)
        {
            var homePage = new HomePage(driver);
            homePage.CreateGameButton.Click();

            var createGame = new CreateGamePage(driver);

            createGame.GameCode.WaitForTextPresent(driver);

            createGame.GameCode.Text.Should().NotBeEmpty();

            var totalNumberOfQuestions = int.Parse(createGame.TotalQuestionCount.Text);
            totalNumberOfQuestions.Should().BeGreaterThan(0);

            createGame.StartGameButton.Click();
            return new NewGameDetails
            {
                TotalNumberOfQuestions = totalNumberOfQuestions,
                GameId = createGame.GameCode.Text
            };
        }
    }
}