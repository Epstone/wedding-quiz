using OpenQA.Selenium;

namespace WeddingQuiz.Test
{
    using System;
    using FluentAssertions;
    using OpenQA.Selenium.Support.PageObjects;
    using OpenQA.Selenium.Support.UI;

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

            WaitUntilTotalQuestionNumberInitialized();

            var gameDetails = new NewGameDetails
            {
                TotalNumberOfQuestions = int.Parse(this.TotalQuestionCount.Text),
                GameId = this.GameCode.Text
            };
            return gameDetails;
        }

        private void WaitUntilTotalQuestionNumberInitialized()
        {
            new WebDriverWait(driver, TimeSpan.FromSeconds(5)).Until(webDriver =>
            {
                var totalNumberOfQuestions = int.Parse(this.TotalQuestionCount.Text);
                return totalNumberOfQuestions > 0;
            });
        }
    }
}