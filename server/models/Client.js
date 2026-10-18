import mongoose from "mongoose";

const clientSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, trim: true, lowercase: true, maxlength: 120, default: "" },
    company: { type: String, trim: true, maxlength: 120, default: "" },
    phone: { type: String, trim: true, maxlength: 40, default: "" },
    address: { type: String, trim: true, maxlength: 300, default: "" },
    expiresAt: { type: Date, default: null },
  },
  { timestamps: true },
);

clientSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.models.Client || mongoose.model("Client", clientSchema);
