/**
 * Utility functions for user-related operations
 */

// Get user initials for avatars
export const getInitials = (name) => {
  if (!name || typeof name !== "string") return "?";

  return name
    .trim()
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

// Generate consistent avatar colors based on user ID or name
export const getAvatarColor = (identifier) => {
  if (!identifier) return "bg-gray-500";

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-teal-500",
    "bg-orange-500",
    "bg-cyan-500",
    "bg-emerald-500",
    "bg-violet-500",
  ];

  // Create a hash from the identifier
  const hash = identifier
    .toString()
    .split("")
    .reduce((acc, char) => {
      return acc + char.charCodeAt(0);
    }, 0);

  const index = hash % colors.length;
  return colors[index];
};

// Get user role display name
export const getRoleDisplayName = (role) => {
  const roleNames = {
    admin: "Administrator",
    officer: "Loan Officer",
    leader: "Group Leader",
    member: "Member",
    guarantor: "Guarantor",
  };

  return roleNames[role] || role;
};

// Get user role color
export const getRoleColor = (role) => {
  const roleColors = {
    admin: "bg-red-100 text-red-800 border-red-200",
    officer: "bg-blue-100 text-blue-800 border-blue-200",
    leader: "bg-green-100 text-green-800 border-green-200",
    member: "bg-gray-100 text-gray-800 border-gray-200",
    guarantor: "bg-purple-100 text-purple-800 border-purple-200",
  };

  return roleColors[role] || roleColors.member;
};

// Check if user has specific permission
export const hasPermission = (user, permission) => {
  if (!user || !user.role) return false;

  const permissions = {
    admin: ["all"],
    officer: [
      "manage_loans",
      "manage_groups",
      "view_reports",
      "manage_members",
    ],
    leader: ["manage_group", "view_group_reports", "manage_group_members"],
    member: ["view_own_data", "apply_loans", "make_contributions"],
    guarantor: ["view_guaranteed_loans"],
  };

  const userPermissions = permissions[user.role] || [];
  return (
    userPermissions.includes("all") || userPermissions.includes(permission)
  );
};

// Get user's full name
export const getFullName = (user) => {
  if (!user) return "Unknown User";

  const firstName = user.firstName || user.first_name || "";
  const lastName = user.lastName || user.last_name || "";

  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  } else if (firstName) {
    return firstName;
  } else if (lastName) {
    return lastName;
  } else if (user.name) {
    return user.name;
  }

  return "Unknown User";
};

// Get user's display name (full name or username)
export const getDisplayName = (user) => {
  if (!user) return "Unknown User";

  const fullName = getFullName(user);
  if (fullName !== "Unknown User") {
    return fullName;
  }

  return user.username || user.email || "Unknown User";
};

// Check if user is active
export const isUserActive = (user) => {
  if (!user) return false;

  // Check various status fields
  if (user.status === "active") return true;
  if (user.isActive === true) return true;
  if (user.active === true) return true;

  // Check if user has been active recently (within last 30 days)
  if (user.lastActive) {
    const lastActive = new Date(user.lastActive);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    return lastActive > thirtyDaysAgo;
  }

  return false;
};

// Get user's age from date of birth
export const getAge = (dateOfBirth) => {
  if (!dateOfBirth) return null;

  const birthDate = new Date(dateOfBirth);
  const today = new Date();

  if (isNaN(birthDate.getTime())) return null;

  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();

  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }

  return age;
};

// Format user's phone number
export const formatUserPhone = (phone) => {
  if (!phone) return "N/A";

  // Remove all non-digits
  const cleaned = phone.replace(/\D/g, "");

  // Format based on length
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
  } else if (cleaned.length === 11 && cleaned.startsWith("1")) {
    return `+1 (${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(7)}`;
  } else if (cleaned.length === 12 && cleaned.startsWith("254")) {
    return `+254 ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`;
  }

  return phone;
};

// Get user's membership duration
export const getMembershipDuration = (joinDate) => {
  if (!joinDate) return "N/A";

  const join = new Date(joinDate);
  const now = new Date();

  if (isNaN(join.getTime())) return "Invalid Date";

  const diffTime = Math.abs(now - join);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const diffMonths = Math.floor(diffDays / 30);
  const diffYears = Math.floor(diffDays / 365);

  if (diffYears > 0) {
    return `${diffYears} year${diffYears > 1 ? "s" : ""}`;
  } else if (diffMonths > 0) {
    return `${diffMonths} month${diffMonths > 1 ? "s" : ""}`;
  } else {
    return `${diffDays} day${diffDays > 1 ? "s" : ""}`;
  }
};
