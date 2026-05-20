import mongoose from "mongoose";
import { Project } from "../models/project.models.js";
import { ProjectMember } from "../models/projectmember.models.js";
import { User } from "../models/user.models.js";
import { Taks } from "../models/task.models.js";
import { Subtask } from "../models/subtask.models.js";
import { ProjectNote } from "../models/note.models.js";
import { ApiError } from "../utils/api-error.js";
import { ApiResponse } from "../utils/api-response.js";
import { asyncHandler } from "../utils/async-handler.js";
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

const createProject = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  try {
    const project = await Project.create({
      name,
      description,
      createdBy: req.user?._id,
    });

    await ProjectMember.create({
      user: req.user?._id,
      project: project._id,
      role: UserRolesEnum.ADMIN,
    });

    return res
      .status(201)
      .json(new ApiResponse(201, { project }, "Project created successfully"));
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, "Project name already exists");
    }
    throw new ApiError(500, error?.message || "Failed to create project");
  }
});

const getProjects = asyncHandler(async (req, res) => {
  const memberships = await ProjectMember.find({ user: req.user?._id })
    .populate({
      path: "project",
      populate: { path: "createdBy", select: "username email fullName avatar" },
    })
    .sort({ createdAt: -1 });

  const projects = memberships
    .filter((m) => m.project)
    .map((m) => ({ project: m.project, role: m.role }));

  return res
    .status(200)
    .json(new ApiResponse(200, { projects }, "Projects fetched successfully"));
});

const getProjectById = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid projectId");
  }

  const project = await Project.findById(projectId).populate({
    path: "createdBy",
    select: "username email fullName avatar",
  });

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const membership = await ProjectMember.findOne({
    project: projectId,
    user: req.user?._id,
  });

  if (!membership) {
    throw new ApiError(403, "You are not a member of this project");
  }

  return res.status(200).json(
    new ApiResponse(
      200,
      { project, role: membership.role },
      "Project fetched successfully",
    ),
  );
});

const updateProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;
  const { name, description } = req.body;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid projectId");
  }

  try {
    const project = await Project.findByIdAndUpdate(
      projectId,
      {
        $set: {
          ...(name !== undefined ? { name } : {}),
          ...(description !== undefined ? { description } : {}),
        },
      },
      { new: true, runValidators: true },
    );

    if (!project) {
      throw new ApiError(404, "Project not found");
    }

    return res
      .status(200)
      .json(new ApiResponse(200, { project }, "Project updated successfully"));
  } catch (error) {
    if (error?.code === 11000) {
      throw new ApiError(409, "Project name already exists");
    }
    throw new ApiError(500, error?.message || "Failed to update project");
  }
});

const deleteProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid projectId");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const tasks = await Taks.find({ project: projectId }).select("_id");
  const taskIds = tasks.map((t) => t._id);

  await Promise.all([
    Subtask.deleteMany({ task: { $in: taskIds } }),
    Taks.deleteMany({ project: projectId }),
    ProjectNote.deleteMany({ project: projectId }),
    ProjectMember.deleteMany({ project: projectId }),
    Project.findByIdAndDelete(projectId),
  ]);

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Project deleted successfully"));
});

const getProjectMembers = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid projectId");
  }

  const membership = await ProjectMember.findOne({
    project: projectId,
    user: req.user?._id,
  });
  if (!membership) {
    throw new ApiError(403, "You are not a member of this project");
  }

  const members = await ProjectMember.find({ project: projectId }).populate({
    path: "user",
    select: "username email fullName avatar",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { members }, "Project members fetched"));
});

const addMembersToProject = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid projectId");
  }

  const project = await Project.findById(projectId);
  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  const incomingMembers = Array.isArray(req.body?.members)
    ? req.body.members
    : req.body?.userId
      ? [{ userId: req.body.userId, role: req.body.role }]
      : [];

  if (incomingMembers.length === 0) {
    throw new ApiError(400, "No members provided");
  }

  const prepared = incomingMembers.map((m) => ({
    userId: m?.userId,
    role: m?.role || UserRolesEnum.MEMBER,
  }));

  for (const member of prepared) {
    if (!mongoose.isValidObjectId(member.userId)) {
      throw new ApiError(400, "Invalid userId in members");
    }

    if (!AvailableUserRole.includes(member.role)) {
      throw new ApiError(400, "Invalid role in members");
    }

    const userExists = await User.exists({ _id: member.userId });
    if (!userExists) {
      throw new ApiError(404, "User not found");
    }

    const alreadyMember = await ProjectMember.exists({
      project: projectId,
      user: member.userId,
    });
    if (alreadyMember) {
      continue;
    }

    await ProjectMember.create({
      project: projectId,
      user: member.userId,
      role: member.role,
    });
  }

  const members = await ProjectMember.find({ project: projectId }).populate({
    path: "user",
    select: "username email fullName avatar",
  });

  return res
    .status(200)
    .json(new ApiResponse(200, { members }, "Members added successfully"));
});

const updateMemberRole = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;
  const { role } = req.body;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid projectId");
  }
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  if (!role) {
    throw new ApiError(400, "Role is required");
  }

  if (!AvailableUserRole.includes(role)) {
    throw new ApiError(400, "Invalid role");
  }

  const member = await ProjectMember.findOneAndUpdate(
    { project: projectId, user: userId },
    { $set: { role } },
    { new: true },
  ).populate({
    path: "user",
    select: "username email fullName avatar",
  });

  if (!member) {
    throw new ApiError(404, "Project member not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, { member }, "Member role updated"));
});

const deleteMember = asyncHandler(async (req, res) => {
  const { projectId, userId } = req.params;

  if (!mongoose.isValidObjectId(projectId)) {
    throw new ApiError(400, "Invalid projectId");
  }
  if (!mongoose.isValidObjectId(userId)) {
    throw new ApiError(400, "Invalid userId");
  }

  const member = await ProjectMember.findOneAndDelete({
    project: projectId,
    user: userId,
  });

  if (!member) {
    throw new ApiError(404, "Project member not found");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Member removed successfully"));
});

export {
  getProjects,
  createProject,
  getProjectById,
  updateProject,
  deleteProject,
  getProjectMembers,
  addMembersToProject,
  updateMemberRole,
  deleteMember,
};
