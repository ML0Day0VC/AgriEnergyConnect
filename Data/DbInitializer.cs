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

            SeedUsers(context, passwordService);
            SeedFarmers(context);
            SeedProducts(context);
        }

        private static void SeedUsers(ApplicationDbContext context, PasswordService passwordService)
        {
            Console.WriteLine("Seeding users...");

            // Create default users with roles
            var users = new List<User>
            {
                // Employee users
                new User { Username = "employee1", Role = "Employee" },
                new User { Username = "admin", Role = "Employee" },
                new User { Username = "supervisor", Role = "Employee" },
                new User { Username = "coordinator", Role = "Employee" },

                // Farmer users - Crop Farmers
                new User { Username = "farmer1", Role = "Farmer" },
                new User { Username = "farmer2", Role = "Farmer" },
                new User { Username = "johnsmith", Role = "Farmer" },
                new User { Username = "sarahjones", Role = "Farmer" },
                new User { Username = "davidmiller", Role = "Farmer" },
                
                // Farmer users - Livestock Farmers
                new User { Username = "michaelbrown", Role = "Farmer" },
                new User { Username = "amandawhite", Role = "Farmer" },
                new User { Username = "robertjohnson", Role = "Farmer" },
                
                // Farmer users - Mixed Farmers
                new User { Username = "jenniferlee", Role = "Farmer" },
                new User { Username = "williamdavis", Role = "Farmer" },
                
                // Farmer users - Green Energy Specialists
                new User { Username = "elizabethgreen", Role = "Farmer" },
                new User { Username = "thomaspower", Role = "Farmer" },
                new User { Username = "nataliesun", Role = "Farmer" }
            };

            // Set the default password for all users
            const string defaultPassword = "Password123!";
            
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
                },
                new Farmer { 
                    Name = "Sarah Jones", 
                    Location = "Limpopo", 
                    ContactInfo = "sarah@example.com", 
                    UserId = farmerUsers[3].Id 
                },
                new Farmer { 
                    Name = "David Miller", 
                    Location = "Free State", 
                    ContactInfo = "david@example.com", 
                    UserId = farmerUsers[4].Id 
                },
                
                // Livestock Farmers
                new Farmer { 
                    Name = "Michael Brown", 
                    Location = "KwaZulu-Natal", 
                    ContactInfo = "michael@example.com", 
                    UserId = farmerUsers[5].Id 
                },
                new Farmer { 
                    Name = "Amanda White", 
                    Location = "Mpumalanga", 
                    ContactInfo = "amanda@example.com", 
                    UserId = farmerUsers[6].Id 
                },
                new Farmer { 
                    Name = "Robert Johnson", 
                    Location = "North West", 
                    ContactInfo = "robertj@example.com", 
                    UserId = farmerUsers[7].Id 
                },
                
                // Mixed Farmers
                new Farmer { 
                    Name = "Jennifer Lee", 
                    Location = "Gauteng", 
                    ContactInfo = "jennifer@example.com", 
                    UserId = farmerUsers[8].Id 
                },
                new Farmer { 
                    Name = "William Davis", 
                    Location = "Western Cape", 
                    ContactInfo = "william@example.com", 
                    UserId = farmerUsers[9].Id 
                },
                
                // Green Energy Specialists
                new Farmer { 
                    Name = "Elizabeth Green", 
                    Location = "Eastern Cape", 
                    ContactInfo = "elizabeth@example.com", 
                    UserId = farmerUsers[10].Id 
                },
                new Farmer { 
                    Name = "Thomas Power", 
                    Location = "Free State", 
                    ContactInfo = "thomas@example.com", 
                    UserId = farmerUsers[11].Id 
                },
                new Farmer { 
                    Name = "Natalie Sun", 
                    Location = "Northern Cape", 
                    ContactInfo = "natalie@example.com", 
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
                "Bell Peppers", "Pumpkins", "Onions", "Garlic"
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
                "Quail Eggs", "Pheasant", "Guinea Fowl", "Specialty Poultry"
            };

            var dairyProducts = new[]
            {
                "Raw Milk", "Artisanal Cheese", "Cultured Butter", "Organic Yogurt",
                "Kefir", "Cream", "Goat Cheese", "Specialty Dairy Products"
            };

            var greenEnergyProducts = new[]
            {
                "Solar Panels", "Wind Turbine Kits", "Biogas Generators", "Solar Water Pumps",
                "Solar Greenhouse Systems", "Biodiesel Production Kits", "Energy Storage Solutions",
                "Energy Efficient Irrigation Systems", "Solar Dryers", "Renewable Energy Consulting"
            };

            // Helper function to generate random date within the past year
            DateTime RandomDate()
            {
                int daysAgo = random.Next(1, 365);
                return DateTime.Now.AddDays(-daysAgo);
            }

            // Add vegetable products for crop farmers (first 5 farmers)
            foreach (var farmer in farmers.Take(5))
            {
                // Each crop farmer has 2-4 vegetable products
                int count = random.Next(2, 5);
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
                
                // Some also have fruits
                if (random.Next(2) == 0) // 50% chance
                {
                    count = random.Next(1, 3);
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
                // Each livestock farmer has 2-3 meat products
                int count = random.Next(2, 4);
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
                
                // Each livestock farmer has 1-2 poultry products
                count = random.Next(1, 3);
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
                
                // Some also have dairy
                if (random.Next(2) == 0) // 50% chance
                {
                    count = random.Next(1, 3);
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
                // Each mixed farmer has 1-2 products from various categories
                var categories = new[] { vegetableProducts, fruitProducts, meatProducts, poultryProducts, dairyProducts };
                
                foreach (var category in categories)
                {
                    if (random.Next(3) > 0) // 66% chance for each category
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
            
            // Add green energy products for energy specialists (last 3 farmers)
            foreach (var farmer in farmers.Skip(10))
            {
                // Each green energy specialist has 2-4 green energy products
                int count = random.Next(2, 5);
                var selectedProducts = greenEnergyProducts.OrderBy(x => random.Next()).Take(count).ToList();
                
                foreach (var product in selectedProducts)
                {
                    products.Add(new Product
                    {
                        Name = product,
                        Category = "Green Energy",
                        ProductionDate = RandomDate(),
                        FarmerId = farmer.Id
                    });
                }
            }

            foreach (var product in products)
            {
                context.Products.Add(product);
            }
            
            context.SaveChanges();
            Console.WriteLine($"Created {products.Count} products");
        }
    }
}