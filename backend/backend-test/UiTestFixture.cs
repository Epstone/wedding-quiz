namespace WeddingQuiz.Test
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.IO;
    using System.Linq;
    using OpenQA.Selenium;
    using OpenQA.Selenium.Chrome;

    public class UiTestFixture : IDisposable
    {
        internal List<IWebDriver> drivers;
        internal Process webServer;

        public UiTestFixture()
        {
            var serverExecutable = Directory.GetCurrentDirectory() + "\\..\\..\\..\\" + "WeddingQuizConsole\\bin\\debug\\WeddingQuizConsole.exe";
            var info = new ProcessStartInfo(serverExecutable);
            info.WindowStyle = ProcessWindowStyle.Minimized;
            webServer = Process.Start(info);

            drivers = new List<IWebDriver>();
        }

        public void Dispose()
        {
            foreach (var webDriver in drivers)
                webDriver?.Dispose();
            webServer?.CloseMainWindow();
            webServer?.Dispose();
        }

        internal IWebDriver CreateOrGetFirstDriver(string defaultUrl = "http://localhost:5000")
        {
            IWebDriver driver;
            if (drivers.Any())
            {
                driver = drivers[0];
                ReInitializeDriver(defaultUrl, driver);
                return driver;
            };


            driver = new ChromeDriver();
            drivers.Add(driver);

            ReInitializeDriver(defaultUrl, driver);

            return driver;
        }

        private static void ReInitializeDriver(string defaultUrl, IWebDriver driver)
        {
            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(3));

            // navigate to page
            driver.Navigate().GoToUrl(defaultUrl);
        }
    }
}