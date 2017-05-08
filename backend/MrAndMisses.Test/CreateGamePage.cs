using OpenQA.Selenium;

namespace WeddingQuiz.Test
{
    using FluentAssertions;
    using OpenQA.Selenium.Support.PageObjects;

    internal class CreateGamePage : BasePage
    {
        [FindsBy(How = How.CssSelector, Using = "[data-test-id='game-code']")]
        public IWebElement GameCode { get; set; }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='start-game']")]
        public IWebElement StartGameButton { get; set; }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='total-questions-no']")]
        public IWebElement TotalQuestionCount { get; set; }


        public CreateGamePage(IWebDriver driver) : base(driver)
        {
        }

        public NewGameDetails CreateGame()
        {
            this.GameCode.WaitForTextPresent(driver);

            this.GameCode.Text.Should().NotBeEmpty();

            var totalNumberOfQuestions = int.Parse(this.TotalQuestionCount.Text);
            totalNumberOfQuestions.Should().BeGreaterThan(0);

            var gameDetails = new NewGameDetails
            {
                TotalNumberOfQuestions = totalNumberOfQuestions,
                GameId = this.GameCode.Text
            };
            return gameDetails;
        }
    }
}