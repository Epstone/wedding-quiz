using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeddingQuiz.Test
{
    using System.Diagnostics;
    using System.IO;
    using System.Threading;
    using FluentAssertions;
    using OpenQA.Selenium;
    using OpenQA.Selenium.Chrome;
    using OpenQA.Selenium.Support.PageObjects;
    using OpenQA.Selenium.Support.UI;
    using WeddingQuizConsole;
    using Xunit;

    public class UiTest
    {
        [Fact]
        public void FirstTest()
        {
            IWebDriver driver = new ChromeDriver();

            var serverExecutable = Directory.GetCurrentDirectory() + "\\..\\..\\..\\" + "WeddingQuizConsole\\bin\\debug\\WeddingQuizConsole.exe";
            ProcessStartInfo info = new ProcessStartInfo(serverExecutable);
            info.WindowStyle = ProcessWindowStyle.Minimized;
            Process webServer = Process.Start(info);

            try
            {
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
                    questionPage.NextQuestionButton.Click();
                }

            }
            finally
            {
                driver.Close();
                driver.Dispose();
                webServer?.CloseMainWindow();
            }
        }


    }
}
