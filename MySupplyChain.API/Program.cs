using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi;
using MySupplyChain.API.Middleware;
using MySupplyChain.Application;
using MySupplyChain.Infrastructure;
using Microsoft.EntityFrameworkCore;
using Serilog;
using Serilog.Events;

if (!IsIntegrationTestRun)
{
    Log.Logger = new LoggerConfiguration()
        .MinimumLevel.Override("Microsoft", LogEventLevel.Warning)
        .Enrich.FromLogContext()
        .WriteTo.Console()
        .CreateBootstrapLogger();
}

try
{
    Log.Information("Starting MySupplyChain API...");

    var builder = WebApplication.CreateBuilder(args);

    // ─── Replace default logging with Serilog ─────────────────────────────────
    // Reads full config from appsettings.json "Serilog" section
    builder.Host.UseSerilog((context, services, configuration) =>
        configuration
            .ReadFrom.Configuration(context.Configuration)
            .ReadFrom.Services(services)
            .Enrich.FromLogContext()
            .Enrich.WithMachineName()
            .Enrich.WithThreadId());

    // ─── Services ─────────────────────────────────────────────────────────────
    builder.Services.AddControllers();
    builder.Services.AddEndpointsApiExplorer();
    builder.Services.AddSwaggerGen(c =>
    {
        c.SwaggerDoc("v1", new OpenApiInfo
        {
            Title = "MySupplyChain API",
            Version = "v1",
            Description = "A modern supply chain management API with AI-powered SSA demand forecasting"
        });

        c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
        {
            Description = "JWT Authorization header using the Bearer scheme. Enter your token below.",
            Name = "Authorization",
            In = ParameterLocation.Header,
            Type = SecuritySchemeType.Http,
            Scheme = "bearer",
            BearerFormat = "JWT"
        });

        c.AddSecurityRequirement(doc =>
        {
            var requirement = new OpenApiSecurityRequirement();
            var schemeRef = new OpenApiSecuritySchemeReference("Bearer", doc);
            requirement.Add(schemeRef, []);
            return requirement;
        });

        var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
        var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
        if (File.Exists(xmlPath))
            c.IncludeXmlComments(xmlPath);
    });

    builder.Services.AddDataProtection();
    builder.Services.AddHttpContextAccessor();

    builder.Services.AddIdentityCore<MySupplyChain.Domain.Entities.User>(options =>
    {
        // Require unique emails for all accounts
        options.User.RequireUniqueEmail = true;
        
        //Add spaces to the allowed user name characters
        options.User.AllowedUserNameCharacters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._@+ ";
        
        // Enforce strong password requirements
        options.Password.RequireDigit = true;
        options.Password.RequiredLength = 8;
        options.Password.RequireNonAlphanumeric = true;
        options.Password.RequireUppercase = true;
        options.Password.RequireLowercase = true;
    })
        .AddEntityFrameworkStores<MySupplyChain.Infrastructure.Persistence.ApplicationDbContext>()
        .AddSignInManager()
        .AddDefaultTokenProviders();

    builder.Services.AddApplication();

    if (!builder.Environment.IsEnvironment("Testing"))
    {
        builder.Services.AddInfrastructure(builder.Configuration);
    }
    else
    {
        var jwtSettings = builder.Configuration
            .GetSection("JwtSettings")
            .Get<MySupplyChain.Infrastructure.Authentication.JwtSettings>();

        builder.Services.Configure<MySupplyChain.Infrastructure.Authentication.JwtSettings>(
            builder.Configuration.GetSection("JwtSettings"));
        builder.Services.AddScoped<MySupplyChain.Application.Common.Interfaces.IAuthService,
            MySupplyChain.Infrastructure.Authentication.AuthService>();

        if (jwtSettings != null)
        {
            builder.Services.AddAuthentication(options =>
            {
                options.DefaultAuthenticateScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
                options.DefaultChallengeScheme = Microsoft.AspNetCore.Authentication.JwtBearer.JwtBearerDefaults.AuthenticationScheme;
            })
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new Microsoft.IdentityModel.Tokens.TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = jwtSettings.Issuer,
                    ValidAudience = jwtSettings.Audience,
                    IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(
                        System.Text.Encoding.UTF8.GetBytes(jwtSettings.Secret))
                };
            });
        }
    }

    builder.Services.AddTransient<GlobalExceptionHandlerMiddleware>();

    // ─── CORS ─────────────────────────────────────────────────────────────────
    // Reads allowed origins from config so local dev and production both work
    var allowedOrigins = builder.Configuration
        .GetSection("AllowedOrigins")
        .Get<string[]>() ?? ["http://localhost:5173"];

    builder.Services.AddCors(options =>
    {
        options.AddDefaultPolicy(policy =>
            policy.WithOrigins(allowedOrigins)
                  .AllowAnyHeader()
                  .AllowAnyMethod()
                  .AllowCredentials());
    });

    var app = builder.Build();

    // ─── Seed Database ─────────────────────────────────────────────────────────
    if (!IsIntegrationTestRun)
    {
        using var scope = app.Services.CreateScope();
        var services = scope.ServiceProvider;
        try
        {
            var context = services.GetRequiredService<MySupplyChain.Infrastructure.Persistence.ApplicationDbContext>();
            await context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            var seederLogger = services.GetRequiredService<ILogger<Program>>();
            seederLogger.LogError(ex, "An error occurred while migrating the database.");
        }
    }

    // ─── Middleware pipeline ───────────────────────────────────────────────────
    app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

    // Serilog HTTP request logging — logs method, path, status code, and elapsed ms
    // Must come after exception handler but before routing
    app.UseSerilogRequestLogging(options =>
    {
        options.MessageTemplate =
            "HTTP {RequestMethod} {RequestPath} responded {StatusCode} in {Elapsed:0.0000} ms";

        // Enrich each request log with additional properties
        options.EnrichDiagnosticContext = (diagnosticContext, httpContext) =>
        {
            diagnosticContext.Set("RequestHost", httpContext.Request.Host.Value ?? "unknown");
            diagnosticContext.Set("UserAgent", httpContext.Request.Headers.UserAgent.FirstOrDefault() ?? "unknown");
            diagnosticContext.Set("UserId",
                httpContext.User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value ?? "anonymous");
        };
    });

    // Swagger always enabled — this is a portfolio demo app
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MySupplyChain API v1");
        c.RoutePrefix = "swagger";
    });

    app.UseCors();
    app.UseHttpsRedirection();
    app.UseAuthentication();
    app.UseAuthorization();
    app.MapControllers();
    app.MapGet("/", () => Results.Redirect("/swagger"));

    Log.Information("MySupplyChain API started. Environment: {Environment}", app.Environment.EnvironmentName);
    app.Run();
}
catch (Exception ex) when (ex is not HostAbortedException)
{
    Log.Fatal(ex, "Application terminated unexpectedly");
}
finally
{
    // Flush all buffered log events before the process exits
    Log.CloseAndFlush();
}

public partial class Program
{
    public static bool IsIntegrationTestRun { get; set; }
}
