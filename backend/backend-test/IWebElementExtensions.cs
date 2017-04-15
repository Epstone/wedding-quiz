using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace WeddingQuiz.Test
{
    using OpenQA.Selenium;
    using OpenQA.Selenium.Support.UI;

    public static class IWebElementExtensions
    {
        public static void WaitForTextToBe(this IWebElement element, string expectedString, IWebDriver driver)
        {
            var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
            wait.Until((IWebDriver d) => element.Text.Equals(expectedString));
        }

        public static void WaitForTextPresent(this IWebElement element, IWebDriver driver)
        {
            var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
            wait.Until((IWebDriver d) => element.Text.Length > 0 );
        }

        public static void WaitForElementToBeDisplayed(this IWebElement element, IWebDriver driver)
        {
            var wait = new WebDriverWait(driver, TimeSpan.FromSeconds(5));
            wait.Until((IWebDriver d) => element.Displayed);
        }
    }
}
