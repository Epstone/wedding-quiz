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
            Process webServer = Process.Start(serverExecutable);

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


                //Thread.Sleep(TimeSpan.FromSeconds(3));
                createGame.StartGameButton.Click();


                var questionPage = new QuestionPage(driver);

                questionPage.CurrentQuestionNumber.WaitForTextToBe("1", driver);

                questionPage.MrButton.Click();
                questionPage.NextQuestionButton.Click();

                questionPage.CurrentQuestionNumber.WaitForTextToBe("2", driver);
            }
            finally
            {
                driver.Close();
                driver.Dispose();
                webServer?.CloseMainWindow();
                webServer?.Kill();
            }
        }


    }
}
