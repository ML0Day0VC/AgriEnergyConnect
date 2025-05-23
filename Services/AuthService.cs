using AgriEnergyConnect.API.Data;
using AgriEnergyConnect.API.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace AgriEnergyConnect.API.Services
{
    public class AuthService
    {
        private readonly ApplicationDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly PasswordService _passwordService;

        public AuthService(ApplicationDbContext context, IConfiguration configuration, PasswordService passwordService)
        {
            _context = context;
            _configuration = configuration;
            _passwordService = passwordService;
        }

        public async Task<(bool success, string token, string role, int? farmerId)> Authenticate(string username, string password)
        {
            var user = await _context.Users
                .Include(u => u.Farmer)
                .FirstOrDefaultAsync(u => u.Username == username);

            if (user == null || !_passwordService.VerifyPassword(user, password))
            {
                return (false, null, null, null);
            }

            // Create token
            var tokenHandler = new JwtSecurityTokenHandler();
            var key = Encoding.ASCII.GetBytes(_configuration["JWT:Secret"]);
            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Username),
                    new Claim(ClaimTypes.Role, user.Role)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };
            var token = tokenHandler.CreateToken(tokenDescriptor);

            return (true, tokenHandler.WriteToken(token), user.Role, user.Farmer?.Id);
        }
    }
}