import mongoose, { Schema } from "mongoose";

const projectMemberSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    role: {
      type: String,
      enum: ["ADMIN", "PROJECT_ADMIN", "MEMBER"],
      default: "MEMBER",
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

const projectSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      required: true,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    members: [projectMemberSchema],
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true },
);

// Add indexes for better query performance
projectSchema.index({ name: 1, owner: 1 });
projectSchema.index({ "members.user": 1 });

// Method to check if a user is a member of the project
projectSchema.methods.isMember = function (userId) {
  return this.members.some(
    (member) => member.user.toString() === userId.toString(),
  );
};

// Method to get a member's role in the project
projectSchema.methods.getMemberRole = function (userId) {
  const member = this.members.find(
    (member) => member.user.toString() === userId.toString(),
  );
  return member ? member.role : null;
};

// Method to check if a user has required role or higher
projectSchema.methods.hasRole = function (userId, requiredRole) {
  const member = this.members.find(
    (member) => member.user.toString() === userId.toString(),
  );
  if (!member) return false;

  const roles = ["MEMBER", "PROJECT_ADMIN", "ADMIN"];
  const memberRoleIndex = roles.indexOf(member.role);
  const requiredRoleIndex = roles.indexOf(requiredRole);

  return memberRoleIndex >= requiredRoleIndex;
};

export const Project = mongoose.model("Project", projectSchema);
