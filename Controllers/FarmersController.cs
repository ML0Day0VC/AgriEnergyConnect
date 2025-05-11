using AgriEnergyConnect.API.Data;
using AgriEnergyConnect.API.Models;
using AgriEnergyConnect.API.Services;
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
        private readonly PasswordService _passwordService;
        private readonly ILogger<FarmersController> _logger;

        public FarmersController(ApplicationDbContext context, PasswordService passwordService, ILogger<FarmersController> logger)
        {
            _context = context;
            _passwordService = passwordService;
            _logger = logger;
        }

        // GET: api/farmers
        [HttpGet]
        [Authorize(Roles = "Employee,Admin")]
        public async Task<ActionResult<IEnumerable<Farmer>>> GetFarmers()
        {
            _logger.LogInformation("Getting all farmers");
            try
            {
                var farmers = await _context.Farmers.ToListAsync();
                _logger.LogInformation($"Successfully retrieved {farmers.Count} farmers");
                return farmers;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to retrieve farmers");
                return StatusCode(500, "An error occurred while retrieving farmers");
            }
        }

        // GET: api/farmers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Farmer>> GetFarmer(int id)
        {
            _logger.LogInformation($"Getting farmer with id: {id}");
            try
            {
                var farmer = await _context.Farmers.FindAsync(id);

                if (farmer == null)
                {
                    _logger.LogWarning($"Farmer with ID {id} not found");
                    return NotFound();
                }

                // Only allow admins/employees to access any farmer, or farmers to access their own profile
                string role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                bool isFarmerAuthorized = IsFarmerAuthorized(farmer.Id);
                
                _logger.LogInformation($"User role: {role}, IsFarmerAuthorized: {isFarmerAuthorized}");
                
                if (role == "Farmer" && !isFarmerAuthorized)
                {
                    _logger.LogWarning($"Access denied for farmer {id}. User is not authorized to view this farmer profile.");
                    return Forbid();
                }

                return farmer;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error retrieving farmer with ID {id}");
                return StatusCode(500, "An error occurred while retrieving the farmer");
            }
        }

        // POST: api/farmers
        [HttpPost]
        [Authorize(Roles = "Employee,Admin")]
        public async Task<ActionResult<Farmer>> CreateFarmer(FarmerCreateRequest request)
        {
            _logger.LogInformation("Creating new farmer");
            try
            {
                // Create user account first
                var user = new User
                {
                    Username = request.Username,
                    Role = "Farmer"
                };

                // Hash the password
                user.PasswordHash = _passwordService.HashPassword(user, request.Password);

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
                _logger.LogInformation($"Created user with ID {user.Id} for new farmer");

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
                _logger.LogInformation($"Successfully created farmer with ID {farmer.Id}");

                return CreatedAtAction(nameof(GetFarmer), new { id = farmer.Id }, farmer);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to create farmer");
                return StatusCode(500, "An error occurred while creating the farmer");
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