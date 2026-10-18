import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 80 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 120 },
    passwordHash: { type: String, required: true },
    // Business details printed on invoices
    business: {
      name: { type: String, trim: true, maxlength: 120, default: "" },
      address: { type: String, trim: true, maxlength: 300, default: "" },
      currency: { type: String, default: "USD", maxlength: 3 },
    },
    // Demo accounts are deleted automatically by MongoDB after this time (TTL index below)
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

userSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

userSchema.methods.toPublic = function () {
  return { id: this._id, name: this.name, email: this.email, business: this.business, isDemo: !!this.expiresAt };
};

export default mongoose.models.User || mongoose.model("User", userSchema);
