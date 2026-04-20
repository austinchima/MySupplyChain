using Microsoft.AspNetCore.Identity;
using Microsoft.OpenApi.Models;
using MySupplyChain.API.Middleware;
using MySupplyChain.Application;
using MySupplyChain.Infrastructure;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new()
    {
        Title = "MySupplyChain API",
        Version = "v1",
        Description = "A modern supply chain management API with AI-powered demand forecasting"
    });

    // Add JWT authentication to Swagger
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter your token below.",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });

    var xmlFile = $"{System.Reflection.Assembly.GetExecutingAssembly().GetName().Name}.xml";
    var xmlPath = Path.Combine(AppContext.BaseDirectory, xmlFile);
    c.IncludeXmlComments(xmlPath);
});

// Add Data Protection services (required by Identity)
builder.Services.AddDataProtection();

// Configure ASP.NET Core Identity
builder.Services.AddIdentityCore<MySupplyChain.Domain.Entities.User>()
    .AddEntityFrameworkStores<MySupplyChain.Infrastructure.Persistence.ApplicationDbContext>()
    .AddSignInManager()
    .AddDefaultTokenProviders();

// Register Application layer
builder.Services.AddApplication();

// Register Infrastructure (SQL Server, etc.) except during Testing to allow InMemory swap
if (!builder.Environment.IsEnvironment("Testing"))
{
    builder.Services.AddInfrastructure(builder.Configuration);
}
else
{
    // In Testing, we still need these baseline registrations that AddInfrastructure usually handles
    var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<MySupplyChain.Infrastructure.Authentication.JwtSettings>();
    builder.Services.Configure<MySupplyChain.Infrastructure.Authentication.JwtSettings>(builder.Configuration.GetSection("JwtSettings"));
    builder.Services.AddScoped<MySupplyChain.Application.Common.Interfaces.IAuthService, MySupplyChain.Infrastructure.Authentication.AuthService>();

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
                IssuerSigningKey = new Microsoft.IdentityModel.Tokens.SymmetricSecurityKey(System.Text.Encoding.UTF8.GetBytes(jwtSettings.Secret))
            };
        });
    }
}

builder.Services.AddTransient<GlobalExceptionHandlerMiddleware>();

var app = builder.Build();

// Configure the HTTP request pipeline
// Add global exception handler first
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "MySupplyChain API v1");
        c.RoutePrefix = "swagger";
    });
}

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.MapGet("/", () => Results.Redirect("/swagger"));

app.Run();

public partial class Program;
