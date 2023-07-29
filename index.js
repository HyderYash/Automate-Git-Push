import { exec } from "child_process";
import { input } from "@inquirer/prompts";
import confirm from "@inquirer/confirm";
import colors from "colors";
import ora from "ora";

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

const log = (msg) => {
  console.log(colors.green(msg));
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

(async function () {
  const onStage = await confirm({ message: "Are you on stage branch?" });
  if (!onStage) {
    log("Checking out to stage branch");
    await execCommand("git checkout stage");
  }
  const addSpinner = ora("Adding files...").start();
  await execCommand("git add -A");
  addSpinner.stop();
  const commitMsg = await input({ message: "Enter commit message:" });
  await execCommand(`git commit -m "${commitMsg}"`, true);
  const spinner = ora("Pushing to stage branch").start();
  await execCommand("git push -u origin stage");
  spinner.text = "Checking out to master";
  await execCommand("git checkout master");
  spinner.text = "Merging Stage";
  await execCommand("git merge stage");
  spinner.text = "Pushing to master branch";
  await execCommand("git push -u origin master");
  spinner.text = "Pushing to both branches done! & going back to stage branch";
  await execCommand("git checkout stage");
  spinner.stop();
  log("All process has been done!");
})();

// const readline = require("readline").createInterface({
//   input: process.stdin,
//   output: process.stdout,
// });

// // Checking revert message

// console.log("Adding files...");
// execCommand("git add -A").then(async () => {
//   readline.question("Enter the commit message: ", async (commitMessage) => {
//     await execCommand(`git commit -m "${commitMessage}"`, true);
//     console.log("Pushing to stage branch");
//     await execCommand("git push -u origin stage");
//     console.log("Checking out to master");
//     await execCommand("git checkout master");
//     console.log("Merging Stage");
//     await execCommand("git merge stage");
//     console.log("Pushing to master branch");
//     await execCommand("git push -u origin master");
//     console.log("Pushing to both branches done!");
//     console.log("Going back to stage branch");
//     await execCommand("git checkout stage");
//     readline.close();
//   });
// });
