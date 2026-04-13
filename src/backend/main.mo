import Map "mo:core/Map";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Iter "mo:core/Iter";
import Int "mo:core/Int";
import Text "mo:core/Text";
import Char "mo:core/Char";
import Nat "mo:core/Nat";
import MixinAuthorization "mo:caffeineai-authorization/MixinAuthorization";
import AccessControl "mo:caffeineai-authorization/access-control";

import List "mo:core/List";


actor {
  // Authorization system
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // Workspace plans
  public type WorkspacePlan = {
    #free;
    #pro;
  };

  // Data store for user workspace plans
  var userWorkspacePlans = Map.empty<Principal, WorkspacePlan>();

  // Demo "plan" selection system (no payments)
  public shared ({ caller }) func selectWorkspacePlan(plan : WorkspacePlan) : async () {
    // Ensure caller is at least authenticated (users and above can select plans)
    // Registered users only (includes Admins)
    if (not (AccessControl.hasPermission(accessControlState, caller, #user))) {
      Runtime.trap("Unauthorized: Only authenticated users can select workspace plans");
    };
    userWorkspacePlans.add(caller, plan);
  };

  // Get the current plan for caller
  public query ({ caller }) func getCallerWorkspacePlan() : async WorkspacePlan {
    switch (userWorkspacePlans.get(caller)) {
      case (?plan) { plan };
      case (null) { #free };
    };
  };

  // Admin can query any user's plan
  public query ({ caller }) func adminGetUserWorkspacePlan(user : Principal) : async WorkspacePlan {
    // Only admin can see other users' plans
    if (not (AccessControl.hasPermission(accessControlState, caller, #admin))) {
      Runtime.trap("Unauthorized: Only admins can access this endpoint");
    };

    switch (userWorkspacePlans.get(user)) {
      case (?plan) { plan };
      case (null) { #free };
    };
  };

  // ==================
  // Usernames
  // ==================

  // Validation constants
  let minUsernameLength = 1;
  let maxUsernameLength = 24;
  let maxNumericLength = 12;

  // Map for storing usernames
  let usernames = Map.empty<Principal, Text>();

  // Set the username immutably
  public shared ({ caller }) func setUsername(name : Text) : async () {
    // Validate username format
    let trimmedName = name.trim(#char ' ');
    let nameLen = trimmedName.size();

    // Validate length
    if (nameLen < minUsernameLength) {
      Runtime.trap("Username too short: must be at least 1 character");
    };
    if (nameLen > maxUsernameLength) {
      Runtime.trap("Username too long: must be 24 characters or less");
    };

    // Convert to List<Text> for easier manipulation
    let chars = List.fromIter(trimmedName.chars());

    // Validate allowed characters and check for numeric-only usernames
    let isValid = chars.foldLeft(
      true,
      func(acc, char) {
        acc and (
          (char >= 'a' and char <= 'z') or // Lowercase letters
          (char >= '0' and char <= '9') or // Numbers
          (char == '-') or // Hyphen
          (char == '_') // Underscore
        );
      },
    );
    if (not isValid) {
      Runtime.trap("Username must contain only lowercase letters, numbers, hyphens, or underscores");
    };

    // Check if the username is entirely numeric
    let isNumeric = chars.foldLeft(
      true,
      func(acc, char) {
        acc and (char >= '0' and char <= '9');
      },
    );

    if (not isNumeric and nameLen > maxUsernameLength) {
      Runtime.trap("Username must be between 1 and 24 characters");
    };

    // Numeric usernames must be 12 characters or less
    if (isNumeric and nameLen > maxNumericLength) {
      Runtime.trap("Numeric usernames must be 12 characters or less");
    };

    // Prevent modifications if username already exists
    switch (usernames.get(caller)) {
      case (?_) {
        Runtime.trap("Username is set once and cannot be changed.");
      };
      case (null) {
        // Username doesn't exist, set it
        usernames.add(caller, trimmedName);
      };
    };
  };

  // Retrieve username
  public query ({ caller }) func getUsername() : async ?Text {
    usernames.get(caller);
  };
};
