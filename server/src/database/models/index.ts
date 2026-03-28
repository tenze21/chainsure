import { Category } from "./category";
import { Claim } from "./claim";
import { Payment } from "./payment";
import { Policy } from "./policy";
import { PolicyTemplate } from "./policy-template";
import { Proposal } from "./proposal";
import { ProposalAttribute } from "./proposal-attribute";
import { Role } from "./role";
import { Subscription } from "./subscription";
import { User } from "./user";
import { Wallet } from "./wallet";

/**
 * role <-> user (one to many)
 * One role can have many users
 */
User.belongsTo(Role, {
  foreignKey: "roleId",
  as: "role",
});

Role.hasMany(User, {
  foreignKey: "roleId",
  as: "users",
  onDelete: "SET NULL",
});

/**
 * user <-> wallet (one to one)
 * each user has their own wallet
 */
User.hasOne(Wallet, {
  foreignKey: "userId",
  as: "wallet",
  onDelete: "CASCADE",
});

Wallet.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

/**
 * user <-> policy (one to many)
 * one user can have many policies
 */
User.hasMany(Policy, {
  foreignKey: "userId",
  as: "policies",
  onDelete: "CASCADE",
});

Policy.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

/**
 * user <-> claim (one to many)
 * one user can have many claims
 */
User.hasMany(Claim, {
  foreignKey: "userId",
  as: "claims",
  onDelete: "CASCADE",
});

Claim.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

/**
 * user <-> proposal (one to many)
 * one user can have many proposals
 */
User.hasMany(Proposal, {
  foreignKey: "userId",
  as: "proposals",
  onDelete: "CASCADE",
});

Proposal.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

/**
 * user <-> subscription (one to many)
 * one user can have many subscriptions
 */
User.hasMany(Subscription, {
  foreignKey: "userId",
  as: "subscriptions",
  onDelete: "CASCADE",
});

Subscription.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

/**
 * user <-> payment (one to many)
 * one user can make many payments
 */
User.hasMany(Payment, {
  foreignKey: "userId",
  as: "payments",
  onDelete: "CASCADE",
});

Payment.belongsTo(User, {
  foreignKey: "userId",
  as: "user",
});

/**
 * category <-> template (one to many)
 * One category can have many templates
 */
PolicyTemplate.belongsTo(Category, {
  foreignKey: "categoryId",
  as: "category",
});

Category.hasMany(PolicyTemplate, {
  foreignKey: "categoryId",
  as: "policyTemplates",
  onDelete: "SET NULL",
});

/**
 * template <-> proposal  (one to many)
 * one template can have many proposals
 */
PolicyTemplate.hasMany(Proposal, {
  foreignKey: "templateId",
  as: "proposals",
  onDelete: "CASCADE",
});

Proposal.belongsTo(PolicyTemplate, {
  foreignKey: "templateId",
  as: "policyTemplate",
});

/**
 * policy <-> claim (one to one)
 * one policy has one claim
 */
Policy.hasOne(Claim, {
  foreignKey: "policyId",
  as: "claim",
  onDelete: "CASCADE",
});

Claim.belongsTo(Policy, {
  foreignKey: "policyId",
  as: "policy",
});

/**
 * policy <-> subscription (one to one)
 * one policy has one subscription
 */
Policy.hasOne(Subscription, {
  foreignKey: "policyId",
  as: "subscription",
  onDelete: "CASCADE",
});

Subscription.belongsTo(Policy, {
  foreignKey: "policyId",
  as: "policy",
});

/**
 * policy <-> payment  (one to many)
 * one policy can be linked to many payments
 */
Policy.hasMany(Payment, {
  foreignKey: "policyId",
  as: "payments",
  onDelete: "CASCADE",
});

Payment.belongsTo(Policy, {
  foreignKey: "policyId",
  as: "policy",
});

/**
 * proposal <-> proposal_attribute  (one to many)
 * one proposal can have many attributes
 */
Proposal.hasMany(ProposalAttribute, {
  foreignKey: "proposalId",
  as: "proposalAttributes",
  onDelete: "CASCADE",
});

ProposalAttribute.belongsTo(Proposal, {
  foreignKey: "proposalId",
  as: "proposal",
});

/**
 * subscription <-> payment  (one to many)
 * one subscription can have many payments
 */
Subscription.hasMany(Payment, {
  foreignKey: "subscriptionId",
  as: "payments",
  onDelete: "CASCADE",
});

Payment.belongsTo(Subscription, {
  foreignKey: "subscriptionId",
  as: "subscription",
});

export { Category, Claim, Payment, Policy, PolicyTemplate, Proposal, ProposalAttribute, Role, Subscription, User, Wallet };

export { sequelize } from "@config/database.js";
