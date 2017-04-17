namespace WeddingQuiz.Test
{
    using FluentAssertions;
    using OpenQA.Selenium;
    using OpenQA.Selenium.Support.PageObjects;

    internal class QuestionPage : BasePage
    {
        [FindsBy(How = How.CssSelector, Using = "[data-test-id='select-mr']")]
        public IWebElement MrButton { get; set; }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='select-mrs']")]
        public IWebElement MrsButton { get; set; }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='select-both']")]
        public IWebElement BothButton { get; set; }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='next-question']")]
        public IWebElement NextQuestionButton { get; set; }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='end-game']")]
        public IWebElement EndGameButton { get; set; }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='current-question-number']")]
        public IWebElement CurrentQuestionNumber { get; set; }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='total-question-number']")]
        public IWebElement TotalQuestionNumber { get; set; }


        public QuestionPage(IWebDriver driver) : base(driver)
        {
        }


        public void AnswerAllQuestions(NewGameDetails gameDetails)
        {
            this.TotalQuestionNumber.Text.Should().Be(gameDetails.TotalNumberOfQuestions.ToString());

            for (var i = 1; i <= gameDetails.TotalNumberOfQuestions; i++)
            {
                this.CurrentQuestionNumber.WaitForTextToContain(i.ToString(), driver);
                this.MrButton.Click();

                if (i < gameDetails.TotalNumberOfQuestions)
                    this.NextQuestionButton.Click();
            }
        }
    }
}