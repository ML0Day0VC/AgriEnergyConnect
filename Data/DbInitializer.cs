using AgriEnergyConnect.API.Models;
using AgriEnergyConnect.API.Services;
using Microsoft.EntityFrameworkCore;

namespace AgriEnergyConnect.API.Data
{
    public static class DbInitializer
    {
        public static void Initialize(ApplicationDbContext context, PasswordService passwordService)
        {       //TODO: remove all green energy people i missunderstood the task
            // Force recreation of database during development for testing
            // Comment these lines for production
            Console.WriteLine("Ensuring database is created with fresh data...");
            context.Database.EnsureDeleted();
            context.Database.EnsureCreated();

            // Check if any users exist - but we've just deleted the DB so this is just a safeguard
            if (context.Users.Any())
            {
                Console.WriteLine("Database already has data, skipping initialization");
                return; // DB has been seeded
            }

            SeedUsers(context, passwordService);
            SeedFarmers(context);
            SeedProducts(context);
            
            Console.WriteLine("Database initialization completed successfully!");
        }

        private static void SeedUsers(ApplicationDbContext context, PasswordService passwordService)
        {
            Console.WriteLine("Seeding users...");

            // Create default users with roles
            var users = new List<User>
            {
                // Admin user - NEW!
                new User { Username = "admin", Role = "Admin" },
                
                // Employee/Admin users
                new User { Username = "employee1", Role = "Employee" },

                // Farmer users - Crop Farmers
                new User { Username = "johndoe", Role = "Farmer" },
                new User { Username = "emilyjohnson", Role = "Farmer" },
                new User { Username = "danielthomson", Role = "Farmer" },
                new User { Username = "oliviasmith", Role = "Farmer" },
                new User { Username = "williamharris", Role = "Farmer" },
                
                // Farmer users - Livestock Farmers
                new User { Username = "jamesanderson", Role = "Farmer" },
                new User { Username = "sophiawilliams", Role = "Farmer" },
                new User { Username = "jacksonbrown", Role = "Farmer" },
                
                // Farmer users - Mixed Farmers
                new User { Username = "oliverjones", Role = "Farmer" },
                new User { Username = "isabelladavis", Role = "Farmer" },
                
                // Farmer users - Green Energy Specialists
                new User { Username = "noahgreen", Role = "Farmer" },
                new User { Username = "emmawatts", Role = "Farmer" },
                new User { Username = "lucassolaris", Role = "Farmer" }
            };

            // Set the default password for all users
            const string defaultPassword = "p";
            
            foreach (var user in users)
            {
                // Hash the password before storing
                user.PasswordHash = passwordService.HashPassword(user, defaultPassword);
                context.Users.Add(user);
            }
            
            context.SaveChanges();
            Console.WriteLine($"Created {users.Count} users");
        }

        private static void SeedFarmers(ApplicationDbContext context)
        {
            Console.WriteLine("Seeding farmers...");

            // Get all user IDs with Farmer role
            var farmerUsers = context.Users.Where(u => u.Role == "Farmer").ToList();
            
            // Create farmer profiles with different specializations
            var farmers = new List<Farmer>
            {
                // Crop Farmers
                new Farmer { 
                    Name = "John Doe", 
                    Location = "Western Cape", 
                    ContactInfo = "john.doe@agrienergyconnect.co.za", 
                    UserId = farmerUsers[0].Id 
                },
                new Farmer { 
                    Name = "Emily Johnson", 
                    Location = "Eastern Cape", 
                    ContactInfo = "emily.johnson@agrienergyconnect.co.za", 
                    UserId = farmerUsers[1].Id 
                },
                new Farmer { 
                    Name = "Daniel Thomson", 
                    Location = "Northern Cape", 
                    ContactInfo = "daniel.thomson@agrienergyconnect.co.za", 
                    UserId = farmerUsers[2].Id 
                },
                new Farmer { 
                    Name = "Olivia Smith", 
                    Location = "Limpopo", 
                    ContactInfo = "olivia.smith@agrienergyconnect.co.za", 
                    UserId = farmerUsers[3].Id 
                },
                new Farmer { 
                    Name = "William Harris", 
                    Location = "Free State", 
                    ContactInfo = "william.harris@agrienergyconnect.co.za", 
                    UserId = farmerUsers[4].Id 
                },
                
                // Livestock Farmers
                new Farmer { 
                    Name = "James Anderson", 
                    Location = "KwaZulu-Natal", 
                    ContactInfo = "james.anderson@agrienergyconnect.co.za", 
                    UserId = farmerUsers[5].Id 
                },
                new Farmer { 
                    Name = "Sophia Williams", 
                    Location = "Mpumalanga", 
                    ContactInfo = "sophia.williams@agrienergyconnect.co.za", 
                    UserId = farmerUsers[6].Id 
                },
                new Farmer { 
                    Name = "Jackson Brown", 
                    Location = "North West", 
                    ContactInfo = "jackson.brown@agrienergyconnect.co.za", 
                    UserId = farmerUsers[7].Id 
                },
                
                // Mixed Farmers
                new Farmer { 
                    Name = "Oliver Jones", 
                    Location = "Gauteng", 
                    ContactInfo = "oliver.jones@agrienergyconnect.co.za", 
                    UserId = farmerUsers[8].Id 
                },
                new Farmer { 
                    Name = "Isabella Davis", 
                    Location = "Western Cape", 
                    ContactInfo = "isabella.davis@agrienergyconnect.co.za", 
                    UserId = farmerUsers[9].Id 
                },
                
                // Green Energy Specialists
                new Farmer { 
                    Name = "Noah Green", 
                    Location = "Eastern Cape", 
                    ContactInfo = "noah.green@agrienergyconnect.co.za", 
                    UserId = farmerUsers[10].Id 
                },
                new Farmer { 
                    Name = "Emma Watts", 
                    Location = "Free State", 
                    ContactInfo = "emma.watts@agrienergyconnect.co.za", 
                    UserId = farmerUsers[11].Id 
                },
                new Farmer { 
                    Name = "Lucas Solaris", 
                    Location = "Northern Cape", 
                    ContactInfo = "lucas.solaris@agrienergyconnect.co.za", 
                    UserId = farmerUsers[12].Id 
                }
            };

            foreach (var farmer in farmers)
            {
                context.Farmers.Add(farmer);
            }
            
            context.SaveChanges();
            Console.WriteLine($"Created {farmers.Count} farmer profiles");
        }

        private static void SeedProducts(ApplicationDbContext context)
        {
            Console.WriteLine("Seeding products...");

            // Get all farmers
            var farmers = context.Farmers.ToList();
            var products = new List<Product>();
            var random = new Random();

            // Different categories of products
            var vegetableProducts = new[]
            {
                "Organic Tomatoes", "Fresh Spinach", "Heirloom Carrots", "Organic Potatoes",
                "Butternut Squash", "Sweet Corn", "Green Beans", "Organic Cabbage",
                "Bell Peppers", "Pumpkins", "Onions", "Garlic", "Broccoli", "Cauliflower",
                "Asparagus", "Eggplant", "Radishes", "Zucchini", "Cucumber", "Kale"
            };

            var fruitProducts = new[]
            {
                "Organic Apples", "Table Grapes", "Strawberries", "Peaches",
                "Nectarines", "Citrus Assortment", "Blueberries", "Watermelons",
                "Pears", "Plums", "Avocados", "Mangoes", "Bananas", "Papayas",
                "Guavas", "Litchis", "Kiwifruit", "Dragon Fruit", "Passion Fruit", "Granadillas"
            };

            var meatProducts = new[]
            {
                "Grass-fed Beef", "Free-range Lamb", "Wild Game Meat", "Organic Pork",
                "Bison Steaks", "Venison", "Goat Meat", "Premium Beef Cuts",
                "Ostrich Meat", "Kudu Steaks", "Springbok Fillets", "Warthog Sausages"
            };

            var poultryProducts = new[]
            {
                "Free-range Eggs", "Organic Chicken", "Heritage Turkey", "Duck",
                "Quail Eggs", "Pheasant", "Guinea Fowl", "Specialty Poultry",
                "Chicken Breasts", "Duck Eggs", "Goose", "Ostrich Eggs"
            };

            var dairyProducts = new[]
            {
                "Raw Milk", "Artisanal Cheese", "Cultured Butter", "Organic Yogurt",
                "Kefir", "Cream", "Goat Cheese", "Specialty Dairy Products",
                "Farm Cheese", "Buttermilk", "Ghee", "Whey Protein"
            };


            // Helper function to generate random date within the past year
            DateTime RandomDate()
            {
                int daysAgo = random.Next(1, 180); // Last 6 months
                return DateTime.Now.AddDays(-daysAgo);
            }

            // Ensure we get to about 50 products by increasing the count for each farmer
            // Add vegetable products for crop farmers (first 5 farmers)
            foreach (var farmer in farmers.Take(5))
            {
                // Each crop farmer has 3-5 vegetable products
                int count = random.Next(3, 6);
                var selectedProducts = vegetableProducts.OrderBy(x => random.Next()).Take(count).ToList();
                
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
                
                // Most also have fruits
                if (random.Next(5) < 4) // 80% chance
                {
                    count = random.Next(2, 4);
                    selectedProducts = fruitProducts.OrderBy(x => random.Next()).Take(count).ToList();
                    
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
            
            // Add meat and poultry products for livestock farmers (next 3 farmers)
            foreach (var farmer in farmers.Skip(5).Take(3))
            {
                // Each livestock farmer has 3-4 meat products
                int count = random.Next(3, 5);
                var selectedProducts = meatProducts.OrderBy(x => random.Next()).Take(count).ToList();
                
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
                
                // Each livestock farmer has 2-3 poultry products
                count = random.Next(2, 4);
                selectedProducts = poultryProducts.OrderBy(x => random.Next()).Take(count).ToList();
                
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
                
                // Most also have dairy
                if (random.Next(5) < 4) // 80% chance
                {
                    count = random.Next(2, 4);
                    selectedProducts = dairyProducts.OrderBy(x => random.Next()).Take(count).ToList();
                    
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
            
            // Add mixed products for mixed farmers (next 2 farmers)
            foreach (var farmer in farmers.Skip(8).Take(2))
            {
                // Each mixed farmer has products from various categories
                var categories = new[] { vegetableProducts, fruitProducts, meatProducts, poultryProducts, dairyProducts };
                
                foreach (var category in categories)
                {
                    if (random.Next(5) < 4) // 80% chance for each category
                    {
                        int count = random.Next(1, 3);
                        var selectedProducts = category.OrderBy(x => random.Next()).Take(count).ToList();
                        string categoryName;
                        
                        if (category == vegetableProducts) categoryName = "Vegetables";
                        else if (category == fruitProducts) categoryName = "Fruit";
                        else if (category == meatProducts) categoryName = "Meat";
                        else if (category == poultryProducts) categoryName = "Poultry";
                        else categoryName = "Dairy";
                        
                        foreach (var product in selectedProducts)
                        {
                            products.Add(new Product
                            {
                                Name = product,
                                Category = categoryName,
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
            Console.WriteLine($"Created {products.Count} products - Initialization complete!");
        }
    }
}