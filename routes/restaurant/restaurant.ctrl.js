const Restaurant = require("../../models/restaurant");
const Menu = require("../../models/menu");

/* CREATE new restaurant */
exports.createRestaurant = async (req, res) => {
  console.log("Request:\n", req);
  console.log("CREATE restaurant:\n", req.body);
  try {
    const restaurant = new Restaurant(req.body);
    const menuList = req.body.menus;

    if (menuList) {
      const promises = menuList.map((element) => {
        const menu = new Menu(element);
        return menu.save();
      });

      const savedMenus = await Promise.all(promises);
      const menuIds = savedMenus.map((element) => element._id);
      restaurant.menus = menuIds;
    }

    console.log("Restaurant", restaurant);
    const output = await restaurant.save();
    res.status(200).json(output);
  } catch (error) {
    console.log(error);
    res.status(400).send({ message: "Restaurant was ill-formed" });
  }
};

// RETRIEVE single Restaurant info
exports.getRestaurant = async (req, res) => {
  const { restr_id } = req.params;
  console.log(restr_id);
  const restaurant = await Restaurant.findById(restr_id).populate("menus");

  console.log(restaurant);
  res.status(200).json(restaurant);
};

exports.getRestaurantsInCategory = async (req, res) => {
  let { category } = req.query;
  category = category.substring(1, category.length - 1);
  console.log(category);

  try {
    const restaurants = await Restaurant.find()
      .where("category")
      .equals(category);

    console.log(restaurants);
    res.status(200).json(restaurants);
  } catch (error) {
    console.log(error);
    res.status(400).json("Category was ill-formed");
  }
};

// UPDATE restaurant info
exports.updateRestaurant = async (req, res) => {
  const { restr_id } = req.params;
  console.log("Update id:", restr_id);
  console.log("UPDATE restraurant:\n", req.body);

  try {
    const updated = await Restaurant.findByIdAndUpdate(restr_id, req.body, {
      new: true,
    }).exec();
    res.status(200).json(updated);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Update failed" });
  }
};

// DELETE restaurant info
exports.deleteRestaurant = async (req, res) => {
  const { restr_id } = req.params;
  console.log("Delete id:", restr_id);
  try {
    const restaurant = await Restaurant.findById(restr_id);
    if (!restaurant) {
      return res.status(404).json({ message: "Restaurant not found" });
    }
    const menus = restaurant.menus;

    await Menu.deleteMany().where("_id").in(menus).exec();
    await Restaurant.findByIdAndDelete(restr_id).exec();

    res.status(200).json({ message: "Delete sucess" });
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: "Deleted failed" });
  }
};