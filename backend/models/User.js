const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, maxlength: 20 },
  usernameLower: { type: String, required: true, unique: true, minlength: 1 },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

UserSchema.index({ usernameLower: 1 }, { unique: true });
UserSchema.index({ email: 1 }, { unique: true });

UserSchema.pre('validate', function() {
  if (this.username && typeof this.username === 'string') {
    this.usernameLower = this.username.toLowerCase();
  }
});

module.exports = mongoose.model('User', UserSchema);
