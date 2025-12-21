/*
 * Author: Austin Chima
 * Summary: Dependency Injection setup for the Application layer.
 *          Registers the MediatR services and other application-specific dependencies.
 * Parameters: IServiceCollection services
 */

using FluentValidation;
using Microsoft.Extensions.DependencyInjection;
using MySupplyChain.Application.Common.Behaviors;
using System.Reflection;

namespace MySupplyChain.Application
{
    /// <summary>
    /// Provides extension methods to register Application layer services.
    /// </summary>
    public static class DependencyInjection
    {
        public static IServiceCollection AddApplication(this IServiceCollection services)
        {
            var assembly = Assembly.GetExecutingAssembly();

            // Register MediatR
            services.AddMediatR(cfg =>
            {
                cfg.RegisterServicesFromAssembly(assembly);
                // Add validation pipeline behavior
                cfg.AddOpenBehavior(typeof(ValidationBehavior<,>));
            });

            // Register FluentValidation validators
            services.AddValidatorsFromAssembly(assembly);

            return services;
        }
    }
}
