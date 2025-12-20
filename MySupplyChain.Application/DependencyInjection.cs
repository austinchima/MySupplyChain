/*
 * Author: Student Architect
 * Summary: Dependency Injection setup for the Application layer.
 *          Registers the MediatR services and other application-specific dependencies.
 * Parameters: IServiceCollection services
 */

using Microsoft.Extensions.DependencyInjection;
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
            // Register MediatR
            services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly()));

            // TODO: Register Domain Services here

            return services;
        }
    }
}
