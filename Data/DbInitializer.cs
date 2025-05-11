using AgriEnergyConnect.API.Models;
using AgriEnergyConnect.API.Services;

namespace AgriEnergyConnect.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context, PasswordService passwordService)
        {
            context.Database.EnsureCreated();

            // Check if any users exist
            if (context.Users.Any())
            {
                return; // DB has been seeded
            }

            // Create default users with roles
            var users = new List<User>
            {
                // Employee users
                new User { Username = "employee1", Role = "Employee" },
                new User { Username = "admin", Role = "Employee" },

                // Farmer users
                new User { Username = "farmer1", Role = "Farmer" },
                new User { Username = "farmer2", Role = "Farmer" },
                new User { Username = "johnsmith", Role = "Farmer" }
            };

            // Set the default password for all users (in a real app, you'd prompt for initial password)
            const string defaultPassword = "Password123!";
            
            foreach (var user in users)
            {
                // Hash the password before storing
                user.PasswordHash = passwordService.HashPassword(user, defaultPassword);
                context.Users.Add(user);
            }
            
            context.SaveChanges();

            // Create farmer profiles for farmer users
            var farmerUsers = context.Users.Where(u => u.Role == "Farmer").ToList();
            var farmers = new List<Farmer>
            {
                new Farmer { 
                    Name = "John Smith", 
                    Location = "Western Cape", 
                    ContactInfo = "john@example.com", 
                    UserId = farmerUsers[0].Id 
                },
                new Farmer { 
                    Name = "Mary Johnson", 
                    Location = "Eastern Cape", 
                    ContactInfo = "mary@example.com", 
                    UserId = farmerUsers[1].Id 
                },
                new Farmer { 
                    Name = "Robert Brown", 
                    Location = "Northern Cape", 
                    ContactInfo = "robert@example.com", 
                    UserId = farmerUsers[2].Id 
                }
            };

            foreach (var farmer in farmers)
            {
                context.Farmers.Add(farmer);
            }
            
            context.SaveChanges();

            // Add some sample products
            var sampleProducts = new List<Product>
            {
                new Product { 
                    Name = "Organic Tomatoes", 
                    Category = "Vegetables", 
                    ProductionDate = DateTime.Now.AddDays(-10), 
                    FarmerId = farmers[0].Id 
                },
                new Product { 
                    Name = "Free-range Eggs", 
                    Category = "Poultry", 
                    ProductionDate = DateTime.Now.AddDays(-5), 
                    FarmerId = farmers[0].Id 
                },
                new Product { 
                    Name = "Grass-fed Beef", 
                    Category = "Meat", 
                    ProductionDate = DateTime.Now.AddDays(-15), 
                    FarmerId = farmers[1].Id 
                },
                new Product { 
                    Name = "Organic Apples", 
                    Category = "Fruit", 
                    ProductionDate = DateTime.Now.AddDays(-3), 
                    FarmerId = farmers[1].Id 
                },
                new Product { 
                    Name = "Solar Panels", 
                    Category = "Green Energy", 
                    ProductionDate = DateTime.Now.AddDays(-7), 
                    FarmerId = farmers[2].Id 
                }
            };

            foreach (var product in sampleProducts)
            {
                context.Products.Add(product);
            }
            
            context.SaveChanges();
        }
    }
}