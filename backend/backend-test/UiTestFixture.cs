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
        private static string defaultUrl = "http://localhost:5000";
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
            {
                webDriver?.Dispose();
            }

            webServer?.CloseMainWindow();
            webServer?.Dispose();
        }

        internal IWebDriver CreateOrGetFirstDriver()
        {
            return CreateOrGetNDriver(1);
        }

        public IWebDriver CreateOrGetSecondDriver()
        {
            return CreateOrGetNDriver(2);
        }

        /// <summary>
        /// Returns a maybe already existing driver
        /// </summary>
        /// <param name="driverNumber">Starting at 1</param>
        /// <returns></returns>
        private IWebDriver CreateOrGetNDriver(int driverNumber)
        {
            IWebDriver driver;
            if (drivers.Count >= driverNumber)
            {
                driver = drivers[driverNumber - 1];
                ReInitializeDriver(driver);
                return driver;
            }

            driver = CreateAndRegisterDriver();

            return driver;
        }

        private IWebDriver CreateAndRegisterDriver()
        {
            IWebDriver driver;
            driver = new ChromeDriver();
            drivers.Add(driver);
            ReInitializeDriver(driver);
            return driver;
        }

        private static void ReInitializeDriver(IWebDriver driver)
        {
            driver.Manage().Timeouts().ImplicitlyWait(TimeSpan.FromSeconds(3));

            // navigate to page
            driver.Navigate().GoToUrl(defaultUrl);
        }
    }
}