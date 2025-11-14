import Category from "../models/Category.js";

export const getCategories = async (req, res) => {
  try {
    const categories = await Category.find({ parent: null })
      .populate("subcategories")
      .sort({ name: 1 });

    const populateSubs = async (cats) => {
      for (const cat of cats) {
        if (cat.subcategories && cat.subcategories.length > 0) {
          cat.subcategories = await Category.find({ _id: { $in: cat.subcategories } })
            .populate("subcategories");
          await populateSubs(cat.subcategories);
        }
      }
    };

    await populateSubs(categories);

    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id)
      .populate("parent")
      .populate("subcategories");

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const createCategory = async (req, res) => {
  try {
    const { name, slug, parent, description, icon } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ message: "Name and slug are required" });
    }

    const category = await Category.create({
      name,
      slug,
      parent: parent || null,
      description: description || "",
      icon: icon || null
    });

    if (parent) {
      const parentCat = await Category.findById(parent);
      if (parentCat) {
        parentCat.subcategories.push(category._id);
        await parentCat.save();
      }
    }

    res.status(201).json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, slug, description, icon } = req.body;

    const category = await Category.findById(id);
    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (name) category.name = name;
    if (slug) category.slug = slug;
    if (description !== undefined) category.description = description;
    if (icon !== undefined) category.icon = icon;

    await category.save();
    res.json(category);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const category = await Category.findById(id);

    if (!category) {
      return res.status(404).json({ message: "Category not found" });
    }

    if (category.subcategories && category.subcategories.length > 0) {
      return res.status(400).json({ message: "Cannot delete category with subcategories" });
    }

    if (category.parent) {
      const parent = await Category.findById(category.parent);
      if (parent) {
        parent.subcategories = parent.subcategories.filter(
          subId => subId.toString() !== id
        );
        await parent.save();
      }
    }

    await Category.findByIdAndDelete(id);
    res.json({ message: "Category deleted" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

