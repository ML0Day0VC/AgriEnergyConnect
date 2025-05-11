namespace AgriEnergyConnect.API.Models
{
    public class Product
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Category { get; set; }
        public DateTime ProductionDate { get; set; }
        
        // Foreign key to Farmer
        public int FarmerId { get; set; }
        public Farmer Farmer { get; set; }
    }
}