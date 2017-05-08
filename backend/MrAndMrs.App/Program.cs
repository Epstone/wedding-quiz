namespace WeddingQuizConsole
{
    using System;
    using Microsoft.AspNetCore.Hosting;

    public class Program
    {
        public static void Main(string[] args)
        {
            var contentRootPath = AppDomain.CurrentDomain.BaseDirectory + "\\..\\..\\";

            var host = new WebHostBuilder()
                .UseKestrel()
                .UseContentRoot(contentRootPath)
                .UseIISIntegration()
                .UseStartup<Startup>()
                .UseUrls("http://localhost:5000")
                .Build();

            host.Run();
        }
    }
}