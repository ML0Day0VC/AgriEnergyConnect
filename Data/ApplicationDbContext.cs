using AgriEnergyConnect.API.Models;
using Microsoft.EntityFrameworkCore;

namespace AgriEnergyConnect.API.Data
{
    public class ApplicationDbContext : DbContext
    {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Farmer> Farmers { get; set; }
        public DbSet<Product> Products { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // Configure relationships
            modelBuilder.Entity<User>()
                .HasOne(u => u.Farmer)
                .WithOne(f => f.User)
                .HasForeignKey<Farmer>(f => f.UserId);

            modelBuilder.Entity<Farmer>()
                .HasMany(f => f.Products)
                .WithOne(p => p.Farmer)
                .HasForeignKey(p => p.FarmerId);

            // Seed data
            SeedData(modelBuilder);
        }

        private void SeedData(ModelBuilder modelBuilder)
        {
            // Seed Users
            modelBuilder.Entity<User>().HasData(
                new User { Id = 1, Username = "employee1", PasswordHash = "AQAAAAEAACcQAAAAEEF5J8cG1bQpB2MFuIbPJKU3DzYl4kjJbxkLFQJiDo0/iN1UNTntcDZAYjcphjXsAg==", Role = "Employee" },
                new User { Id = 2, Username = "farmer1", PasswordHash = "AQAAAAEAACcQAAAAEEF5J8cG1bQpB2MFuIbPJKU3DzYl4kjJbxkLFQJiDo0/iN1UNTntcDZAYjcphjXsAg==", Role = "Farmer" },
                new User { Id = 3, Username = "farmer2", PasswordHash = "AQAAAAEAACcQAAAAEEF5J8cG1bQpB2MFuIbPJKU3DzYl4kjJbxkLFQJiDo0/iN1UNTntcDZAYjcphjXsAg==", Role = "Farmer" }
            );

            // Seed Farmers
            modelBuilder.Entity<Farmer>().HasData(
                new Farmer { Id = 1, Name = "John Smith", Location = "Western Cape", ContactInfo = "john@example.com", UserId = 2 },
                new Farmer { Id = 2, Name = "Mary Johnson", Location = "Eastern Cape", ContactInfo = "mary@example.com", UserId = 3 }
            );

            // Seed Products
            modelBuilder.Entity<Product>().HasData(
                new Product { Id = 1, Name = "Organic Tomatoes", Category = "Vegetables", ProductionDate = DateTime.Now.AddDays(-10), FarmerId = 1 },
                new Product { Id = 2, Name = "Free-range Eggs", Category = "Poultry", ProductionDate = DateTime.Now.AddDays(-5), FarmerId = 1 },
                new Product { Id = 3, Name = "Grass-fed Beef", Category = "Meat", ProductionDate = DateTime.Now.AddDays(-15), FarmerId = 2 },
                new Product { Id = 4, Name = "Organic Apples", Category = "Fruit", ProductionDate = DateTime.Now.AddDays(-3), FarmerId = 2 }
            );
        }
    }
}