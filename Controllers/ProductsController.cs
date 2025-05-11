using AgriEnergyConnect.API.Data;
using AgriEnergyConnect.API.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

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
        [Authorize(Roles = "Employee")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProducts()
        {
            return await _context.Products
                .Include(p => p.Farmer)
                .ToListAsync();
        }

        // GET: api/products/farmer/5
        [HttpGet("farmer/{farmerId}")]
        public async Task<ActionResult<IEnumerable<Product>>> GetProductsByFarmer(int farmerId, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, [FromQuery] string category)
        {
            // Only allow employees to access any farmer's products, or farmers to access their own products
            if (User.IsInRole("Farmer") && !IsFarmerAuthorized(farmerId))
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

            return await query.ToListAsync();
        }

        // POST: api/products
        [HttpPost]
        [Authorize(Roles = "Farmer")]
        public async Task<ActionResult<Product>> CreateProduct(ProductCreateRequest request)
        {
            // Verify the farmer is adding to their own profile
            var farmerId = GetCurrentFarmerId();
            if (farmerId == null)
            {
                return BadRequest("No associated farmer profile found");
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

        private bool IsFarmerAuthorized(int farmerId)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            return _context.Farmers.Any(f => f.Id == farmerId && f.UserId == userId);
        }

        private int? GetCurrentFarmerId()
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            return _context.Farmers.FirstOrDefault(f => f.UserId == userId)?.Id;
        }
    }

    public class ProductCreateRequest
    {
        public string Name { get; set; }
        public string Category { get; set; }
        public DateTime ProductionDate { get; set; }
    }
}