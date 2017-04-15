namespace WeddingQuiz.Test
{
    using OpenQA.Selenium;
    using OpenQA.Selenium.Support.PageObjects;

    internal class HighscorePage : BasePage
    {
        [FindsBy(How = How.TagName, Using = "h2")]
        public IWebElement Heading { get; set; }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='game-code']")]
        public IWebElement GameCode { get; set; }

        public HighscorePage(IWebDriver driver) : base(driver)
        {
        }
    }
}