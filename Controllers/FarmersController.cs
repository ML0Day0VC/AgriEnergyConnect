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

        public FarmersController(ApplicationDbContext context, PasswordService passwordService)
        {
            _context = context;
            _passwordService = passwordService;
        }

        // GET: api/farmers
        [HttpGet]
        [Authorize(Roles = "Employee,Admin")]
        public async Task<ActionResult<IEnumerable<Farmer>>> GetFarmers()
        {

            try
            {
                var farmers = await _context.Farmers.ToListAsync();
                return farmers;
            }
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while retrieving farmers");
            }
        }

        // GET: api/farmers/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Farmer>> GetFarmer(int id)
        {
            try
            {
                var farmer = await _context.Farmers.FindAsync(id);

                if (farmer == null)
                {
                    return NotFound();
                }

                // Only allow admins/employees to access any farmer, or farmers to access their own profile
                string? role = User.FindFirst(System.Security.Claims.ClaimTypes.Role)?.Value;
                bool isFarmerAuthorized = IsFarmerAuthorized(farmer.Id);
                

                
                if (role == "Farmer" && !isFarmerAuthorized)
                {
             
                    return Forbid();
                }

                return farmer;
            }
            catch (Exception ex)
            {

                return StatusCode(500, "An error occurred while retrieving the farmer");
            }
        }

        // POST: api/farmers
        [HttpPost]
        [Authorize(Roles = "Employee,Admin")]
        public async Task<ActionResult<Farmer>> CreateFarmer(FarmerCreateRequest request)
        {

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
            catch (Exception ex)
            {

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
                //todo
                var userId = int.Parse(User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value);
                bool isAuthorized = _context.Farmers.Any(f => f.Id == farmerId && f.UserId == userId);
             
                return isAuthorized;
            }
            catch (Exception ex)
            {
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