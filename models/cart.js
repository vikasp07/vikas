const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CartSchema = new Schema({
  owner: { type: Schema.Types.ObjectId, ref: "User", required: true },
  items: [
    {
      item: { type: Schema.Types.ObjectId, ref: "Item" },
      title: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, default: 1 },
    },
  ],
});

module.exports = mongoose.model("Cart", CartSchema);
