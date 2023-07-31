const { exec } = require("child_process");
const { input } = require("@inquirer/prompts");
const confirm = require("@inquirer/confirm");
const chalk = require("chalk");

const execCommand = (command, getCommit = false) => {
  return new Promise((resolve) => {
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error.message}`);
        return;
      }
      if (getCommit === true) {
        const commitId = await getCommitID(stdout);
        console.log(`COMMIT ID: ${commitId}`);
      }
      console.log(stdout);
      resolve(true);
    });
  });
};

const log = (msg, c = "green") => {
  console.log(chalk[c](msg));
};

const getCommitID = (msg) => {
  return new Promise((resolve) => {
    const regex = /\[stage (\w+)\]/;
    const match = msg.match(regex);

    if (match && match.length >= 2) {
      const commitId = match[1];
      resolve(commitId);
    }
  });
};
// hello

(async function () {
  const onStage = await confirm.default({
    message: "Are you on stage branch?",
  });
  if (!onStage) {
    log("Checking out to stage branch");
    await execCommand("git checkout stage");
  }
  log("Adding files...");
  await execCommand("git add -A");
  const commitMsg = await input({ message: "Enter commit message:" });
  await execCommand(`git commit -m "${commitMsg}"`, true);
  log("Pushing to stage branch");
  await execCommand("git push -u origin stage");
  log("Checking out to master");
  await execCommand("git checkout master");
  log("Merging Stage");
  await execCommand("git merge stage");
  log("Pushing to master branch");
  await execCommand("git push -u origin master");
  log("Pushing to both branches done! & going back to stage branch");
  await execCommand("git checkout stage");
  log("All process has been done!", "bgBlue");
})();
