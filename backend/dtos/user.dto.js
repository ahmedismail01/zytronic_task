const sanitizeUser = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    username: user.username,
    email: user.email,
    avatar_url: user.avatar_url,
    created_at: user.created_at,
    updated_at: user.updated_at,
  };
};

const sanitizeUserForPublic = (user) => {
  if (!user) return null;

  return {
    _id: user._id,
    username: user.username,
    avatar_url: user.avatar_url,
  };
};

module.exports = {
  sanitizeUser,
  sanitizeUserForPublic,
};
