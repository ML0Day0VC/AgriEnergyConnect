using AgriEnergyConnect.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace AgriEnergyConnect.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AuthService _authService;

        public AuthController(AuthService authService)
        {
            _authService = authService;
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest request)
        {
            if (string.IsNullOrEmpty(request.Username) || string.IsNullOrEmpty(request.Password))
            {
                return BadRequest(new { message = "Username and password are required" });
            }

            var (success, token, role, farmerId) = await _authService.Authenticate(request.Username, request.Password);

            if (!success)
            {
                return Unauthorized(new { message = "Invalid username or password" });
            }

            return Ok(new
            {
                token,
                role,
                farmerId
            });
        }
    }

    public class LoginRequest
    {
        public string Username { get; set; }
        public string Password { get; set; }
    }
}