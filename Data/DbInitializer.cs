// STEP 1: Stop your application completely

// STEP 2: Delete the SQLite database file
// Look for a file named something like "agrienergyconnect.db" or similar in your project folder
// Delete this file completely

// STEP 3: Use this simplified DbInitializer.cs
using AgriEnergyConnect.API.Models;
using AgriEnergyConnect.API.Services;
using Microsoft.EntityFrameworkCore;

namespace AgriEnergyConnect.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context, PasswordService passwordService)
        {
            // Always recreate database in development
            Console.WriteLine("Ensuring database is created with fresh data...");
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();

            // Double-check - if somehow data exists, don't seed again
            if (context.Users.Any())
            {
                Console.WriteLine("Database already has data, skipping initialization");
                return;
            }

            SeedUsers(context, passwordService);
            SeedFarmers(context);
            SeedProducts(context);
            
            Console.WriteLine("Database initialization completed successfully!");
        }

        private static void SeedUsers(ApplicationDbContext context, PasswordService passwordService)
        {
            Console.WriteLine("Seeding users...");

            var users = new List<User>
            {
                // Admin user
                new User { Username = "admin", Role = "Admin" },
                
                // Employee user
                new User { Username = "employee1", Role = "Employee" },

                // Farmer users ONLY - NO GREEN ENERGY USERS
                new User { Username = "johndoe", Role = "Farmer" },
                new User { Username = "emilyjohnson", Role = "Farmer" },
                new User { Username = "danielthomson", Role = "Farmer" },
                new User { Username = "oliviasmith", Role = "Farmer" },
                new User { Username = "williamharris", Role = "Farmer" },
                new User { Username = "jamesanderson", Role = "Farmer" },
                new User { Username = "sophiawilliams", Role = "Farmer" },
                new User { Username = "jacksonbrown", Role = "Farmer" },
                new User { Username = "oliverjones", Role = "Farmer" },
                new User { Username = "isabelladavis", Role = "Farmer" }
            };

            const string defaultPassword = "p";
            
            foreach (var user in users)
            {
                user.PasswordHash = passwordService.HashPassword(user, defaultPassword);
                context.Users.Add(user);
            }
            
            context.SaveChanges();
            Console.WriteLine($"Created {users.Count} users (NO green energy users)");
        }

        private static void SeedFarmers(ApplicationDbContext context)
        {
            Console.WriteLine("Seeding farmers...");

            var farmerUsers = context.Users.Where(u => u.Role == "Farmer").ToList();
            
            var farmers = new List<Farmer>
            {
                new Farmer { Name = "John Doe", Location = "Western Cape", ContactInfo = "john.doe@agrienergyconnect.co.za", UserId = farmerUsers[0].Id },
                new Farmer { Name = "Emily Johnson", Location = "Eastern Cape", ContactInfo = "emily.johnson@agrienergyconnect.co.za", UserId = farmerUsers[1].Id },
                new Farmer { Name = "Daniel Thomson", Location = "Northern Cape", ContactInfo = "daniel.thomson@agrienergyconnect.co.za", UserId = farmerUsers[2].Id },
                new Farmer { Name = "Olivia Smith", Location = "Limpopo", ContactInfo = "olivia.smith@agrienergyconnect.co.za", UserId = farmerUsers[3].Id },
                new Farmer { Name = "William Harris", Location = "Free State", ContactInfo = "william.harris@agrienergyconnect.co.za", UserId = farmerUsers[4].Id },
                new Farmer { Name = "James Anderson", Location = "KwaZulu-Natal", ContactInfo = "james.anderson@agrienergyconnect.co.za", UserId = farmerUsers[5].Id },
                new Farmer { Name = "Sophia Williams", Location = "Mpumalanga", ContactInfo = "sophia.williams@agrienergyconnect.co.za", UserId = farmerUsers[6].Id },
                new Farmer { Name = "Jackson Brown", Location = "North West", ContactInfo = "jackson.brown@agrienergyconnect.co.za", UserId = farmerUsers[7].Id },
                new Farmer { Name = "Oliver Jones", Location = "Gauteng", ContactInfo = "oliver.jones@agrienergyconnect.co.za", UserId = farmerUsers[8].Id },
                new Farmer { Name = "Isabella Davis", Location = "Western Cape", ContactInfo = "isabella.davis@agrienergyconnect.co.za", UserId = farmerUsers[9].Id }
            };

            foreach (var farmer in farmers)
            {
                context.Farmers.Add(farmer);
            }
            
            context.SaveChanges();
            Console.WriteLine($"Created {farmers.Count} farmer profiles (NO green energy farmers)");
        }

        private static void SeedProducts(ApplicationDbContext context)
        {
            Console.WriteLine("Seeding products...");

            var farmers = context.Farmers.ToList();
            var products = new List<Product>();
            var random = new Random();

            // Product arrays - NO GREEN ENERGY PRODUCTS
            var vegetableProducts = new[]
            {
                "Organic Tomatoes", "Fresh Spinach", "Heirloom Carrots", "Organic Potatoes",
                "Butternut Squash", "Sweet Corn", "Green Beans", "Organic Cabbage",
                "Bell Peppers", "Pumpkins", "Onions", "Garlic", "Broccoli", "Cauliflower"
            };

            var fruitProducts = new[]
            {
                "Organic Apples", "Table Grapes", "Strawberries", "Peaches",
                "Nectarines", "Citrus Assortment", "Blueberries", "Watermelons",
                "Pears", "Plums", "Avocados", "Mangoes"
            };

            var meatProducts = new[]
            {
                "Grass-fed Beef", "Free-range Lamb", "Wild Game Meat", "Organic Pork",
                "Bison Steaks", "Venison", "Goat Meat", "Premium Beef Cuts"
            };

            var poultryProducts = new[]
            {
                "Free-range Eggs", "Organic Chicken", "Heritage Turkey", "Duck",
                "Quail Eggs", "Pheasant", "Guinea Fowl", "Chicken Breasts"
            };

            var dairyProducts = new[]
            {
                "Raw Milk", "Artisanal Cheese", "Cultured Butter", "Organic Yogurt",
                "Kefir", "Cream", "Goat Cheese", "Farm Cheese"
            };

            DateTime RandomDate()
            {
                int daysAgo = random.Next(1, 180);
                return DateTime.Now.AddDays(-daysAgo);
            }

            // Seed products for different farmer types
            // Crop farmers (first 5)
            foreach (var farmer in farmers.Take(5))
            {
                int count = random.Next(3, 6);
                var selectedProducts = vegetableProducts.OrderBy(x => random.Next()).Take(count);
                
                foreach (var product in selectedProducts)
                {
                    products.Add(new Product
                    {
                        Name = product,
                        Category = "Vegetables",
                        ProductionDate = RandomDate(),
                        FarmerId = farmer.Id
                    });
                }
                
                // Add some fruits
                if (random.Next(5) < 4)
                {
                    count = random.Next(2, 4);
                    selectedProducts = fruitProducts.OrderBy(x => random.Next()).Take(count);
                    
                    foreach (var product in selectedProducts)
                    {
                        products.Add(new Product
                        {
                            Name = product,
                            Category = "Fruit",
                            ProductionDate = RandomDate(),
                            FarmerId = farmer.Id
                        });
                    }
                }
            }
            
            // Livestock farmers (next 3)
            foreach (var farmer in farmers.Skip(5).Take(3))
            {
                // Meat products
                int count = random.Next(3, 5);
                var selectedProducts = meatProducts.OrderBy(x => random.Next()).Take(count);
                
                foreach (var product in selectedProducts)
                {
                    products.Add(new Product
                    {
                        Name = product,
                        Category = "Meat",
                        ProductionDate = RandomDate(),
                        FarmerId = farmer.Id
                    });
                }
                
                // Poultry products
                count = random.Next(2, 4);
                selectedProducts = poultryProducts.OrderBy(x => random.Next()).Take(count);
                
                foreach (var product in selectedProducts)
                {
                    products.Add(new Product
                    {
                        Name = product,
                        Category = "Poultry",
                        ProductionDate = RandomDate(),
                        FarmerId = farmer.Id
                    });
                }
                
                // Dairy products
                if (random.Next(5) < 4)
                {
                    count = random.Next(2, 4);
                    selectedProducts = dairyProducts.OrderBy(x => random.Next()).Take(count);
                    
                    foreach (var product in selectedProducts)
                    {
                        products.Add(new Product
                        {
                            Name = product,
                            Category = "Dairy",
                            ProductionDate = RandomDate(),
                            FarmerId = farmer.Id
                        });
                    }
                }
            }
            
            // Mixed farmers (remaining 2)
            foreach (var farmer in farmers.Skip(8))
            {
                var categories = new[] { vegetableProducts, fruitProducts, meatProducts, poultryProducts, dairyProducts };
                var categoryNames = new[] { "Vegetables", "Fruit", "Meat", "Poultry", "Dairy" };
                
                for (int i = 0; i < categories.Length; i++)
                {
                    if (random.Next(5) < 3) // 60% chance for each category
                    {
                        int count = random.Next(1, 3);
                        var selectedProducts = categories[i].OrderBy(x => random.Next()).Take(count);
                        
                        foreach (var product in selectedProducts)
                        {
                            products.Add(new Product
                            {
                                Name = product,
                                Category = categoryNames[i],
                                ProductionDate = RandomDate(),
                                FarmerId = farmer.Id
                            });
                        }
                    }
                }
            }
            
            foreach (var product in products)
            {
                context.Products.Add(product);
            }
            
            context.SaveChanges();
            Console.WriteLine($"Created {products.Count} products (NO green energy products)");
        }
    }
}