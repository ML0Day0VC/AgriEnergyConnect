namespace AgriEnergyConnect.API.Models
{
    public class Farmer
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Location { get; set; }
        public string ContactInfo { get; set; }
        
        // Foreign key to User
        public int UserId { get; set; }
        public User User { get; set; }
        
        // Navigation property to Products
        public ICollection<Product> Products { get; set; } = new List<Product>();
    }
}