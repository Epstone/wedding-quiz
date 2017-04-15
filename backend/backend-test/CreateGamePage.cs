using OpenQA.Selenium;

namespace WeddingQuiz.Test
{
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
    }
}