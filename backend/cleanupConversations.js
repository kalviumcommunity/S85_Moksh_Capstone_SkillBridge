const mongoose = require('mongoose');
const Conversation = require('./models/conversation');
const User = require('./models/user');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/YOUR_DB_NAME';

async function cleanupConversations() {
  await mongoose.connect(MONGO_URI);

  const conversations = await Conversation.find({});
  let removed = 0;

  for (const conv of conversations) {
    let hasMissing = false;
    for (const participant of conv.participants) {
      const user = await User.findById(participant);
      if (!user) {
        hasMissing = true;
        break;
      }
    }
    if (hasMissing) {
      console.log(`Deleting conversation ${conv._id} with missing user(s):`, conv.participants);
      await Conversation.deleteOne({ _id: conv._id });
      removed++;
    }
  }

  console.log(`Cleanup complete. Removed ${removed} conversations with missing users.`);
  mongoose.disconnect();
}

async function generateUniqueUsername(base) {
  let username = base;
  let counter = 1;
  while (await User.findOne({ username })) {
    username = `${base}${counter}`;
    counter++;
  }
  return username;
}

async function updateMissingUsernames() {
  await mongoose.connect(MONGO_URI);
  const users = await User.find({ $or: [ { username: { $exists: false } }, { username: null }, { username: '' } ] });
  for (const user of users) {
    let baseUsername = user.email ? user.email.split('@')[0] : (user.name || 'user').replace(/\s+/g, '').toLowerCase();
    const uniqueUsername = await generateUniqueUsername(baseUsername);
    user.username = uniqueUsername;
    await user.save();
    console.log(`Updated user ${user._id} with username: ${uniqueUsername}`);
  }
  await mongoose.disconnect();
  console.log('All missing usernames updated.');
}

// cleanupConversations(); // <-- commented out to avoid MongoDB connection issues
updateMissingUsernames().catch(err => {
  console.error(err);
  process.exit(1);
});
