using AgriEnergyConnect.API.Data;
using AgriEnergyConnect.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Text.Json.Serialization;
using System.Text.Json;

namespace AgriEnergyConnect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ProductsController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<ProductsController> _logger;

        public ProductsController(ApplicationDbContext context, ILogger<ProductsController> logger)
        {
            _context = context;
            _logger = logger;
        }

        // GET: api/products
        [HttpGet]
        [Authorize(Roles = "Employee,Admin")]
        public async Task<ActionResult<IEnumerable<ProductWithFarmerDto>>> GetProducts()
        {
            _logger.LogInformation("Getting all products");
            
            try
            {
                var products = await _context.Products
                    .Include(p => p.Farmer)
                    .ToListAsync();
                
                var productDtos = products.Select(p => new ProductWithFarmerDto
                {
                    Id = p.Id,
                    Name = p.Name,
                    Category = p.Category,
                    ProductionDate = p.ProductionDate,
                    FarmerId = p.FarmerId,
                    FarmerName = p.Farmer?.Name ?? "Unknown"
                }).ToList();
                
                _logger.LogInformation($"Successfully retrieved {products.Count} products");
                return Ok(productDtos);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve products");
                return StatusCode(500, new { message = "An error occurred while retrieving products" });
            }
        }

        // GET: api/products/farmer/5
        [HttpGet("farmer/{farmerId}")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsByFarmer(int farmerId, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, [FromQuery] string category = "")
        {
            _logger.LogInformation($"Getting products for farmer {farmerId} with filters: startDate={startDate}, endDate={endDate}, category={category}");
            
            try
            {
                // Only allow admins, employees, or the farmer themselves to access products
                string role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                bool isFarmerAuthorized = IsFarmerAuthorized(farmerId);
                
                _logger.LogInformation($"User role: {role}, IsFarmerAuthorized: {isFarmerAuthorized}");
                
                if (role == "Farmer" && !isFarmerAuthorized)
                {
                    _logger.LogWarning($"Access denied for farmer {farmerId}. User is not authorized to view these products.");
                    return Forbid();
                }

                var query = _context.Products.Where(p => p.FarmerId == farmerId);

                // Apply filters if provided
                if (startDate.HasValue)
                {
                    query = query.Where(p => p.ProductionDate >= startDate.Value);
                }

                if (endDate.HasValue)
                {
                    query = query.Where(p => p.ProductionDate <= endDate.Value);
                }

                if (!string.IsNullOrEmpty(category))
                {
                    query = query.Where(p => p.Category == category);
                }

                var products = await query.ToListAsync();
                _logger.LogInformation($"Successfully retrieved {products.Count} products for farmer {farmerId}");
                return Ok(products);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Failed to retrieve products for farmer {farmerId}");
                return StatusCode(500, new { message = $"An error occurred while retrieving products: {ex.Message}" });
            }
        }

        // POST: api/products
        [HttpPost]
        [Authorize(Roles = "Farmer")]
        public async Task<ActionResult<Product>> CreateProduct(ProductCreateRequest request)
        {
            try
            {
                // Verify the farmer is adding to their own profile
                var farmerId = GetCurrentFarmerId();
                if (farmerId == null)
                {
                    _logger.LogWarning("No associated farmer profile found for user");
                    return BadRequest(new { message = "No associated farmer profile found" });
                }

                var product = new Product
                {
                    Name = request.Name,
                    Category = request.Category,
                    ProductionDate = request.ProductionDate,
                    FarmerId = farmerId.Value
                };

                _context.Products.Add(product);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Successfully created product {product.Id} for farmer {product.FarmerId}");

                return CreatedAtAction("GetProductsByFarmer", new { farmerId = product.FarmerId }, product);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create product");
                return StatusCode(500, new { message = $"An error occurred while creating the product: {ex.Message}" });
            }
        }

        private bool IsFarmerAuthorized(int farmerId)
        {
            try
            {
                // Admin can access any farmer's data
                if (User.IsInRole("Admin"))
                {
                    return true;
                }
                
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
                bool isAuthorized = _context.Farmers.Any(f => f.Id == farmerId && f.UserId == userId);
                _logger.LogInformation($"IsFarmerAuthorized check: UserId={userId}, FarmerId={farmerId}, IsAuthorized={isAuthorized}");
                return isAuthorized;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in IsFarmerAuthorized method");
                return false;
            }
        }

        private int? GetCurrentFarmerId()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
                var farmerId = _context.Farmers.FirstOrDefault(f => f.UserId == userId)?.Id;
                _logger.LogInformation($"GetCurrentFarmerId: UserId={userId}, FarmerId={farmerId}");
                return farmerId;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Error in GetCurrentFarmerId method");
                return null;
            }
        }
    }

    public class ProductCreateRequest
    {
        public string Name { get; set; }
        public string Category { get; set; }
        public DateTime ProductionDate { get; set; }
    }

    public class ProductWithFarmerDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public DateTime ProductionDate { get; set; }
        public int FarmerId { get; set; }
        public string FarmerName { get; set; }
    }
}