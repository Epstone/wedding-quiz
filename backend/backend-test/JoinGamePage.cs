﻿namespace WeddingQuiz.Test
{
    using OpenQA.Selenium;
    using OpenQA.Selenium.Support.PageObjects;

    internal class JoinGamePage : BasePage
    {
        public JoinGamePage(IWebDriver driver) : base(driver)
        {
        }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='textbox-name']")]
        public IWebElement UsernameTextbox { get; set; }

        [FindsBy(How = How.CssSelector, Using = "[data-test-id='textbox-game-id']")]
        public IWebElement GameIdTextbox { get; set; }
    }
}