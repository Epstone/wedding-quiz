using System;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeddingQuiz.Test
{
    using System.Threading;
    using FluentAssertions;
    using OpenQA.Selenium.Support.PageObjects;
    using OpenQA.Selenium.Support.UI;
    using WeddingQuizConsole;
    using Xunit;

    public class UiTest : IClassFixture<UiTestFixture>
    {
        private UiTestFixture fixture;



        public UiTest(UiTestFixture fixture)
        {
            this.fixture = fixture;
        }

        [Fact]
        public void FirstTest()
        {
            var driver = fixture.CreateDriver();

            // web driver 
            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(3));

            // navigate to page
            driver.Navigate().GoToUrl("http://localhost:5000");

            var homePage = new HomePage(driver);
            homePage.CreateGameButton.Click();

            var createGame = new CreateGamePage(driver);

            createGame.GameCode.WaitForTextPresent(driver);

            createGame.GameCode.Text.Should().NotBeEmpty();

            var totalNumberOfQuestions = int.Parse(createGame.TotalQuestionCount.Text);
            totalNumberOfQuestions.Should().BeGreaterThan(0);

            createGame.StartGameButton.Click();

            var questionPage = new QuestionPage(driver);
            questionPage.TotalQuestionNumber.Text.Should().Be(totalNumberOfQuestions.ToString());

            for (int i = 1; i <= totalNumberOfQuestions; i++)
            {
                questionPage.CurrentQuestionNumber.WaitForTextToBe(i.ToString(), driver);
                questionPage.MrButton.Click();

                if (i < totalNumberOfQuestions)
                {
                    questionPage.NextQuestionButton.Click();
                }
            }

            //end game
            questionPage.EndGameButton.WaitForElementToBeDisplayed(driver);
            questionPage.EndGameButton.Click();

            // highscore is shown
            var highScore = new HighscorePage(driver);
            highScore.Heading.WaitForTextToBe("Übersicht", driver);
        }
    }
}
