using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace MrAndMrs.App3
{
    using Helper;
    using Microsoft.AspNetCore.StaticFiles.Infrastructure;
    using Newtonsoft.Json;
    using Storage;

    public class Startup
    {
        public Startup(IHostingEnvironment env)
        {
            var builder = new ConfigurationBuilder()
                .SetBasePath(env.ContentRootPath)
                .AddJsonFile("appsettings.json", optional: false, reloadOnChange: true)
                .AddJsonFile($"appsettings.{env.EnvironmentName}.json", optional: true)
                .AddEnvironmentVariables();
            Configuration = builder.Build();
        }

        public IConfigurationRoot Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            var settings = new JsonSerializerSettings { ContractResolver = new SignalRContractResolver() };
            var serializer = JsonSerializer.Create(settings);
            services.AddSingleton(serializer);

            var appConfig = Configuration.GetConnectionString("MrAndMrsTableStorage");

            services.AddScoped<GameRepository>(provider => new GameRepository(appConfig));
            services.AddSignalR(options =>
            {
                options.Hubs.EnableDetailedErrors = true;
                options.Hubs.EnableJavaScriptProxies = true;
            });

            services.AddMvc();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IHostingEnvironment env, ILoggerFactory loggerFactory)
        {
            //GlobalHost.DependencyResolver.Register(
            //    typeof(ChatHub),
            //    () => new ChatHub(new ChatMessageRepository()));

            var staticFileOptions = new StaticFileOptions(sharedOptions: new SharedOptions()) { ServeUnknownFileTypes = true };

            loggerFactory.AddConsole(Configuration.GetSection("Logging"));
            loggerFactory.AddDebug();

            app.UseDefaultFiles();

            app.UseStaticFiles();

            app.UseMvcWithDefaultRoute();
            app.UseWebSockets();
            app.UseSignalR("/signalr");
        }
    }
}
