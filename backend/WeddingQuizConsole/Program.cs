using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IO;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Server.Kestrel;
using Microsoft.AspNetCore.Server.IISIntegration;

namespace WeddingQuizConsole
{
    using System.Threading;
    using Microsoft.Owin.Hosting;


    class Program
    {
        static void Main(string[] args)
        {
            //string baseAddress = "http://*:80/";

            //using (WebApp.Start<Startup>(url: baseAddress))
            //{
            //    Thread.Sleep(Timeout.Infinite);
            //}

            var host = new WebHostBuilder()
               .UseKestrel()
               .UseContentRoot(Directory.GetCurrentDirectory()+"\\..\\..\\")
               .UseIISIntegration()
               .UseStartup<Startup>()
               .UseUrls("http://localhost:5000")
               .Build();

            host.Run();
        }
    }
}
