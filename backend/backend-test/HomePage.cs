namespace WeddingQuiz.Test
{
    using OpenQA.Selenium;
    using OpenQA.Selenium.Support.PageObjects;

    internal class HomePage : BasePage
    {
        public HomePage(IWebDriver driver) : base(driver)
        {
        }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='create-game']")]
        public IWebElement CreateGameButton { get; set; }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='join-game']")]
        public IWebElement JoinGameButton { get; set; }
    }

    internal class BasePage
    {
        public IWebDriver _driver;

        public BasePage(IWebDriver driver)
        {
            _driver = driver;
            PageFactory.InitElements(_driver, this);
        }
    }
}