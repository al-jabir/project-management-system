import mongoose, { Schema } from "mongoose";

const taskAttachmentSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    url: {
      type: String,
      required: true,
    },
    localPath: String,
    uploadedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const subtaskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: String,
    isCompleted: {
      type: Boolean,
      default: false,
    },
    completedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    completedAt: Date,
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  { timestamps: true },
);

const taskSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    project: {
      type: Schema.Types.ObjectId,
      ref: "Project",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["TODO", "IN_PROGRESS", "DONE"],
      default: "TODO",
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH"],
      default: "MEDIUM",
    },
    assignee: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    dueDate: Date,
    attachments: [taskAttachmentSchema],
    subtasks: [subtaskSchema],
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    // Add virtual for completion percentage
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Indexes for better query performance
taskSchema.index({ project: 1, status: 1 });
taskSchema.index({ project: 1, assignee: 1 });
taskSchema.index({ dueDate: 1 }, { sparse: true });

// Virtual for completion percentage based on subtasks
taskSchema.virtual("completionPercentage").get(function () {
  if (!this.subtasks || this.subtasks.length === 0) return 0;
  const completedSubtasks = this.subtasks.filter(
    (subtask) => subtask.isCompleted,
  ).length;
  return Math.round((completedSubtasks / this.subtasks.length) * 100);
});

// Pre-save middleware to update task status based on subtasks
taskSchema.pre("save", function (next) {
  if (this.subtasks && this.subtasks.length > 0) {
    const allCompleted = this.subtasks.every((subtask) => subtask.isCompleted);
    const someCompleted = this.subtasks.some((subtask) => subtask.isCompleted);

    if (allCompleted) {
      this.status = "DONE";
    } else if (someCompleted) {
      this.status = "IN_PROGRESS";
    }
  }
  next();
});

export const Task = mongoose.model("Task", taskSchema);
