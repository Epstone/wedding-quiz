namespace WeddingQuiz.Test
{
    using OpenQA.Selenium;
    using OpenQA.Selenium.Support.PageObjects;

    internal class LobbyPage : BasePage
    {
        public LobbyPage(IWebDriver driver) : base(driver)
        {
        }

        [FindsBy(How = How.TagName, Using = "h2")]
        public IWebElement Heading { get; set; }

    }
}