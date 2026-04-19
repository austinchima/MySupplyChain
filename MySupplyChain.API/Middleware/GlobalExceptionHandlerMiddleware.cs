using System.Net;
using System.Text.Json;
using MySupplyChain.Application.Common.Exceptions;

namespace MySupplyChain.API.Middleware;

/// <summary>
/// Global exception handling middleware that catches all exceptions and returns consistent error responses
/// </summary>
public class GlobalExceptionHandlerMiddleware(
    ILogger<GlobalExceptionHandlerMiddleware> logger,
    IHostEnvironment env) : IMiddleware
{
    private static readonly JsonSerializerOptions SerializerOptions = new()
    {
        PropertyNamingPolicy = JsonNamingPolicy.CamelCase
    };

    public async Task InvokeAsync(HttpContext context, RequestDelegate next)
    {
        try
        {
            await next(context);
        }
        catch (Exception ex)
        {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception)
    {
        context.Response.ContentType = "application/json";
        int statusCode;
        object problemDetails;

        switch (exception)
        {
            case ValidationException validationEx:
                statusCode = (int)HttpStatusCode.BadRequest;
                problemDetails = new
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.1",
                    Title = "One or more validation errors occurred.",
                    Status = statusCode,
                    validationEx.Errors
                };
                logger.LogWarning("Validation error: {@ValidationErrors}", validationEx.Errors);
                break;

            case NotFoundException notFoundEx:
                statusCode = (int)HttpStatusCode.NotFound;
                problemDetails = new
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.5.4",
                    Title = "The requested resource was not found.",
                    Status = statusCode,
                    Detail = notFoundEx.Message
                };
                logger.LogWarning("Resource not found: {Message}", notFoundEx.Message);
                break;

            default:
                statusCode = (int)HttpStatusCode.InternalServerError;
                var detail = "An unexpected error occurred. Please try again later.";

                if (env.IsDevelopment())
                {
                    detail = exception.ToString();
                }

                problemDetails = new
                {
                    Type = "https://tools.ietf.org/html/rfc7231#section-6.6.1",
                    Title = "An error occurred while processing your request.",
                    Status = statusCode,
                    Detail = detail
                };
                logger.LogError(exception, "Unhandled exception occurred: {Message}", exception.Message);
                break;
        }

        context.Response.StatusCode = statusCode;

        var json = JsonSerializer.Serialize(problemDetails, SerializerOptions);

        await context.Response.WriteAsync(json);
    }
}
