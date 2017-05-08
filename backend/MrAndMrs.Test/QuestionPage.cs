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

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='current-question']")]
        public IWebElement CurrentQuestion { get; set; }

        public QuestionPage(IWebDriver driver) : base(driver)
        {
        }


        public void AnswerAllQuestions(NewGameDetails gameDetails)
        {
            this.TotalQuestionNumber.Text.Should().Be(gameDetails.TotalNumberOfQuestions.ToString());

            for (var i = 1; i <= gameDetails.TotalNumberOfQuestions; i++)
            {
                WaitForCurrentQuestionNumberToBe(i);
                this.MrButton.Click();

                if (i < gameDetails.TotalNumberOfQuestions)
                    this.NextQuestionButton.Click();
            }
        }

        private void WaitForCurrentQuestionNumberToBe(int i)
        {
            this.CurrentQuestionNumber.WaitForTextToContain(i.ToString(), driver);
        }

        public bool AnswerQuestion()
        {
            bool isLastQuestion = false;
            var currentQuestionNo = GetCurrentQuestionNo();

            this.MrButton.Click();

            if (GetCurrentQuestionNo() < GetTotalQuestionNumber())
            {
                this.NextQuestionButton.Click();
                WaitForCurrentQuestionNumberToBe(currentQuestionNo + 1);
            }
            else
            {
                isLastQuestion = true;
            }


            return isLastQuestion;
        }

        private int GetTotalQuestionNumber()
        {
            return int.Parse(TotalQuestionNumber.Text);
        }

        private int GetCurrentQuestionNo()
        {
            return int.Parse(this.CurrentQuestionNumber.Text);
        }
    }
}