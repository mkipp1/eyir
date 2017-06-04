require('dotenv').config({path: process.argv[2]})

process.setMaxListeners(20);

const Discord = require("discord.js");
const RoleCache = require("./RoleCache.js")

const bot = new Discord.Client();
bot.login(process.env.TOKEN);

bot.on('ready', () => {
  console.log('I am ready!');

  run();
});

let roleCache = null

function run() {
  
  let guild = bot.guilds.first();
  guild.fetchMembers()
    .then(g => {
      roleCache = new RoleCache(g.roles)
    })
}

bot.on("message", msg => {

  let prefix = "!";

  if(!msg.content.startsWith(prefix)) return;

  if(msg.author.bot) return;

  if (msg.content.startsWith(prefix + "valarjar")) {
    let guild = msg.guild
    
    guild.fetchMembers()
      .then(g => g.members.array())
      .then(members => {
        members.forEach(member => {

          if (shouldApplyValarjar(member.roles)) {
            addRole(member, "Valarjar");
          }
        })
      })
      .catch(console.error);
  }
});

function shouldApplyValarjar(memberRoles) {

  for (var i = 0; i < excludedRoles.length; i++) {
    if (memberRoles.findKey('id', excludedRoles[i]) == excludedRoles[i]) {
      return false;
    }
  }

  return true;
}

let excludedRoles = [
  "269363541570617345", // Valarjar
  "148893703207911433", // Val'kyr
  "257983573498265600", // Val'kyr
  "197179529360310272", // Theorycrafter
  "201785195441946624", // Odyn
  "257988415704924162" // Odny's Minions
];

bot.on('guildMemberAdd', member => {
  newMemberMessage(member);
  addRole(member, "Valarjar")
});

function newMemberMessage(member) {
  
  const welcomeMessage = member.displayName + ", welcome to **Skyhold**! Please go over the server rules in #welcome. Before asking a question, go over all of the available guides and resources in #guides-resources-faq; many frequently asked questions are answered there. Remember to check the Pinned Messages in each text channel for additional information. You can do so by clicking the Pin icon at the top right of your Discord window: <http://i.imgur.com/TuYQkjJ.png>. If you're unable to find an answer to your question or if you need clarification on something, please ask! That's what we're here for. :smile: We hope you enjoy your time in Skyhold!"

  member.createDM()
    .then(channel => {
      channel.send(welcomeMessage)
        .catch(console.error);
      console.log("Sent welcome message to " + member.displayName)
    });
  
}

function addRole(member, roleName) {

  const role = roleCache.getByName(roleName);
  member.addRole(role)
    .catch(console.error);
  console.log("Added " + role.name + " to " + member.displayName)
}