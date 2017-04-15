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


    public class Program
    {
        public static void Main(string[] args)
        {
            
            string contentRootPath = AppDomain.CurrentDomain.BaseDirectory + "\\..\\..\\";
            
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
