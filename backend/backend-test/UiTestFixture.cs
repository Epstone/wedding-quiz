namespace WeddingQuiz.Test
{
    using System;
    using System.Collections.Generic;
    using System.Diagnostics;
    using System.IO;
    using OpenQA.Selenium;
    using OpenQA.Selenium.Chrome;

    public class UiTestFixture : IDisposable
    {
        internal List<IWebDriver> drivers;
        internal Process webServer;

        public UiTestFixture()
        {
            drivers = new List<IWebDriver>();
            CreateDriver();

            var serverExecutable = Directory.GetCurrentDirectory() + "\\..\\..\\..\\" + "WeddingQuizConsole\\bin\\debug\\WeddingQuizConsole.exe";
            var info = new ProcessStartInfo(serverExecutable);
            info.WindowStyle = ProcessWindowStyle.Minimized;
            webServer = Process.Start(info);
        }

        public void Dispose()
        {
            foreach (var webDriver in drivers)
                webDriver?.Dispose();
            webServer?.CloseMainWindow();
            webServer?.Dispose();
        }

        internal IWebDriver CreateDriver()
        {
            var driver = new ChromeDriver();
            drivers.Add(driver);
            return driver;
        }
    }
}