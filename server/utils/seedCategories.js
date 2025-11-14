import mongoose from "mongoose";
import dotenv from "dotenv";
import Category from "../models/Category.js";

dotenv.config();

const categories = [
  {
    name: "Tech",
    slug: "tech",
    subcategories: [
      {
        name: "Peripherals",
        slug: "tech-peripherals",
        subcategories: []
      },
      {
        name: "Accessories",
        slug: "tech-accessories",
        subcategories: []
      },
      {
        name: "Devices",
        slug: "tech-devices",
        subcategories: [
          { name: "Laptops", slug: "tech-devices-laptops" },
          { name: "Tablets", slug: "tech-devices-tablets" },
          { name: "Phones", slug: "tech-devices-phones" }
        ]
      }
    ]
  },
  {
    name: "Gaming",
    slug: "gaming",
    subcategories: [
      {
        name: "Console Ecosystems",
        slug: "gaming-console-ecosystems",
        subcategories: [
          { name: "Xbox", slug: "gaming-xbox" },
          { name: "PlayStation", slug: "gaming-playstation" },
          { name: "Nintendo", slug: "gaming-nintendo" }
        ]
      },
      {
        name: "Handheld Devices",
        slug: "gaming-handheld-devices",
        subcategories: [
          { name: "Steam Deck", slug: "gaming-steam-deck" },
          { name: "ROG Ally", slug: "gaming-rog-ally" },
          { name: "Legion Go", slug: "gaming-legion-go" },
          { name: "Other Handhelds", slug: "gaming-other-handhelds" }
        ]
      },
      {
        name: "Retro Devices",
        slug: "gaming-retro-devices",
        subcategories: []
      },
      {
        name: "Games",
        slug: "gaming-games",
        subcategories: [
          { name: "Used Console Games", slug: "gaming-used-console-games" },
          { name: "Mint/Sealed Copies", slug: "gaming-mint-sealed" },
          { name: "Open-but-New Copies", slug: "gaming-open-new" }
        ]
      },
      {
        name: "Collectibles",
        slug: "gaming-collectibles",
        subcategories: [
          { name: "Console Collectibles", slug: "gaming-console-collectibles" },
          { name: "Retro Collectible Games", slug: "gaming-retro-collectible-games" },
          { name: "Figurines", slug: "gaming-figurines" },
          { name: "Limited Editions", slug: "gaming-limited-editions" }
        ]
      },
      {
        name: "Console Accessories & Peripherals",
        slug: "gaming-console-accessories-peripherals",
        subcategories: []
      }
    ]
  }
];

async function seedCategories() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    await Category.deleteMany({});
    console.log("Cleared existing categories");

    async function createCategory(catData, parentId = null) {
      const subcategoryIds = [];
      
      if (catData.subcategories && catData.subcategories.length > 0) {
        for (const sub of catData.subcategories) {
          const subcategory = await createCategory(sub, null);
          subcategoryIds.push(subcategory._id);
        }
      }

      const category = await Category.create({
        name: catData.name,
        slug: catData.slug,
        parent: parentId,
        subcategories: subcategoryIds
      });

      if (subcategoryIds.length > 0) {
        await Category.updateMany(
          { _id: { $in: subcategoryIds } },
          { $set: { parent: category._id } }
        );
      }

      return category;
    }

    for (const cat of categories) {
      await createCategory(cat);
    }

    console.log("Categories seeded successfully");
    process.exit(0);
  } catch (error) {
    console.error("Error seeding categories:", error);
    process.exit(1);
  }
}

seedCategories();
