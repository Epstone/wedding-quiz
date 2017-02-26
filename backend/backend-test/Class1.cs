namespace backend_test
{
    using System;
    using WeddingQuizConsole.Controllers;
    using Xunit;
    using Xunit.Abstractions;

    public class Class1
    {
        private ITestOutputHelper testOutputHelper;


        public Class1(ITestOutputHelper output)
        {
            testOutputHelper = output;
        }

        [Fact]
        public void When__user_creates_game_verify_one_game_is_stored()
        {
            GameController controller = new GameController();
            var result = controller.Create().Result;

            testOutputHelper.WriteLine(controller.Response.HttpContext.Response.Body.ToString());
        }
    }
}