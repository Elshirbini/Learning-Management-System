import { User } from "./user.js";
import { Course } from "./course.js";
import { Module } from "./module.js";
import { Content } from "./content.js";
import { Review } from "./review.js";
import { Cart, CartItems } from "./cart.js";

//                       Relation between courses and user(student) (many-to-many)
User.belongsToMany(Course, {
  foreignKey: "user_id",
  through: "purchases",
  as: "EnrolledCourses",
  onDelete: "CASCADE",
});
Course.belongsToMany(User, {
  foreignKey: "course_id",
  through: "purchases",
  as: "EnrolledStudents",
  onDelete: "CASCADE",
});

//                       Relation between courses and user(instructor) (one-to-many)
User.hasMany(Course, {
  foreignKey: "user_id",
  as: "CreatedCourses",
  onDelete: "CASCADE",
});
Course.belongsTo(User, {
  foreignKey: "user_id",
  as: "Instructor",
});

//                      Relation between Module and course (one-to-many)
Course.hasMany(Module, {
  foreignKey: "course_id",
  as: "Modules",
  onDelete: "CASCADE",
});
Module.belongsTo(Course, { foreignKey: "course_id", as: "Course" });

//                      Relation between Content and Module (one-to-many)
Module.hasMany(Content, {
  foreignKey: "module_id",
  as: "Contents",
  onDelete: "CASCADE",
});
Content.belongsTo(Module, { foreignKey: "module_id", as: "Module" });

//                      Relation between reviews and courses (one-to-many)
Course.hasMany(Review, {
  foreignKey: "course_id",
  as: "Reviews",
  onDelete: "CASCADE",
});
Review.belongsTo(Course, { foreignKey: "course_id", as: "Course" });

//                      Relation between reviews and users (one-to-many)
User.hasMany(Review, {
  foreignKey: "user_id",
  as: "Reviews",
  onDelete: "CASCADE",
});
Review.belongsTo(User, { foreignKey: "user_id", as: "User" });

//                      Relation between cart and user (one-to-one)
User.hasOne(Cart, { foreignKey: "user_id", as: "Cart", onDelete: "CASCADE" });
Cart.belongsTo(User, { foreignKey: "user_id", as: "User" });

//                      Relation between cart and cartItems (one-to-many)
Cart.hasMany(CartItems, {
  foreignKey: "cart_id",
  as: "CartItem",
  onDelete: "CASCADE",
});
CartItems.belongsTo(Cart, { foreignKey: "cart_id", as: "Cart" });

//                      Relation between course and cartItems (one-to-many)
Course.hasMany(CartItems, {
  foreignKey: "course_id",
  as: "CartItem",
  onDelete: "CASCADE",
});
CartItems.belongsTo(Course, { foreignKey: "course_id", as: "Course" });

export { User, Course, Module, Content, Review, Cart, CartItems };
