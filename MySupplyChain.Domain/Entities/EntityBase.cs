/*
 * Author: Austin Chima
 * Base class for all domain entities.
 */

namespace MySupplyChain.Domain.Entities;

/// <summary>
/// Abstract base class for all domain entities with common properties
/// </summary>

public abstract class EntityBase
{
    /// <summary>
    /// Unique identifier for the entity
    /// </summary>
    public int Id { get; set; }
    
    /// <summary>
    /// When the entity was created (UTC)
    /// </summary>
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    
    /// <summary>
    /// When the entity was last updated (UTC)
    /// </summary>
    public DateTime? UpdatedAt { get; set; }
}
