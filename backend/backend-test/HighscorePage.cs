namespace WeddingQuiz.Test
{
    using OpenQA.Selenium;
    using OpenQA.Selenium.Support.PageObjects;

    internal class HighscorePage : BasePage
    {
        //[FindsBy(How = How.TagName, Using = "h2")]
        public IWebElement Heading
        {
            get { return base.driver.FindElement(By.CssSelector("[data-test-id='heading']")); }
        }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='game-code']")]
        public IWebElement GameCode { get; set; }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='current-question']")]
        public IWebElement CurrentQuestion { get; set; }

        public HighscorePage(IWebDriver driver) : base(driver)
        {
        }
    }
}