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


        public ProductsController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/products
        [HttpGet]
        [Authorize(Roles = "Employee,Admin")]
        public async Task<ActionResult<IEnumerable<ProductWithFarmerDto>>> GetProducts()
        {

            
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

                return Ok(productDtos);
            }
            catch (Exception ex)
            {

                return StatusCode(500, new { message = "An error occurred while retrieving products" });
            }
        }

        // GET: api/products/farmer/5
        [HttpGet("farmer/{farmerId}")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsByFarmer(int farmerId, [FromQuery] DateTime? startDate = null, [FromQuery] DateTime? endDate = null, [FromQuery] string category = "")
        {
      
            
            try
            {
                // Only allow admins, employees, or the farmer themselves to access products
                string? role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                bool isFarmerAuthorized = IsFarmerAuthorized(farmerId);
                

                if (role == "Farmer" && !isFarmerAuthorized)
                {
                 
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

                return Ok(products);
            }
            catch (Exception ex)
            {

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
  

                return CreatedAtAction("GetProductsByFarmer", new { farmerId = product.FarmerId }, product);
            }
            catch (Exception ex)
            {
           
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
            
                return isAuthorized;
            }
            catch (Exception ex)
            {

                return false;
            }
        }

        private int? GetCurrentFarmerId()
        {
            try
            {
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
                var farmerId = _context.Farmers.FirstOrDefault(f => f.UserId == userId)?.Id;

                return farmerId;
            }
            catch (Exception ex)
            {

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