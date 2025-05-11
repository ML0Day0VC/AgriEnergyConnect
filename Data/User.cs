namespace AgriEnergyConnect.API.Models
{
    public class User
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string PasswordHash { get; set; }
        public string Role { get; set; } // "Farmer" or "Employee"
        
        // If user is a farmer, they'll have related farmer profile
        public Farmer? Farmer { get; set; }
    }
}
