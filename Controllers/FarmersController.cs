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
    public class FarmersController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public FarmersController(ApplicationDbContext context)
        {
            _context = context;
        }

        // GET: api/farmers
        [HttpGet]
        [Authorize(Roles = "Employee")]
        public async Task<ActionResult<IEnumerable<Farmer>>> GetFarmers()
        {
            return await _context.Farmers.ToListAsync();
        }

        // GET: api/farmers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Farmer>> GetFarmer(int id)
        {
            var farmer = await _context.Farmers.FindAsync(id);

            if (farmer == null)
            {
                return NotFound();
            }

            // Only allow employees to access any farmer, or farmers to access their own profile
            if (User.IsInRole("Farmer") && !IsFarmerAuthorized(farmer.Id))
            {
                return Forbid();
            }

            return farmer;
        }

        // POST: api/farmers
        [HttpPost]
        [Authorize(Roles = "Employee")]
        public async Task<ActionResult<Farmer>> CreateFarmer(FarmerCreateRequest request)
        {
            // Create user account first
            var user = new User
            {
                Username = request.Username,
                PasswordHash = "AQAAAAEAACcQAAAAEEF5J8cG1bQpB2MFuIbPJKU3DzYl4kjJbxkLFQJiDo0/iN1UNTntcDZAYjcphjXsAg==", // In real app, hash the password
                Role = "Farmer"
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            // Now create farmer profile
            var farmer = new Farmer
            {
                Name = request.Name,
                Location = request.Location,
                ContactInfo = request.ContactInfo,
                UserId = user.Id
            };

            _context.Farmers.Add(farmer);
            await _context.SaveChangesAsync();

            return CreatedAtAction(nameof(GetFarmer), new { id = farmer.Id }, farmer);
        }

        private bool IsFarmerAuthorized(int farmerId)
        {
            var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
            return _context.Farmers.Any(f => f.Id == farmerId && f.UserId == userId);
        }
    }

    public class FarmerCreateRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public string Name { get; set; }
        public string Location { get; set; }
        public string ContactInfo { get; set; }
    }
}