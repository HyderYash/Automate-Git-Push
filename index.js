const { exec } = require("child_process");
const { input } = require("@inquirer/prompts");
const confirm = require("@inquirer/confirm");
const select = require("@inquirer/select");
const chalk = require("chalk");

const execCommand = (command, getCommit = false) => {
  return new Promise((resolve) => {
    exec(command, async (error, stdout, stderr) => {
      if (error) {
        console.log(`error: ${error}`);
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

const branchChanger = async (branchName) => {
  log(`Checking out to ${branchName} branch`);
  await execCommand(`git checkout ${branchName}`);
};

const addFileAndCommit = () => {
  return new Promise(async (resolve) => {
    log("Adding files...");
    await execCommand("git add -A");
    const commitMsg = await input({ message: "Enter commit message:" });
    await execCommand(`git commit -m "${commitMsg}"`, true);
    resolve(true);
  });
};

const pushToStageOnly = async () => {
  log("Pushing ONLY to stage branch", "red");
  await execCommand("git push -u origin stage");
};

const pushToMasterOnly = async () => {
  log("Pushing ONLY to master branch", "red");
  await execCommand("git push -u origin master");
};

// MASTER CHANGE and it should be in stage also
(async function () {
  log(
    "YOU SHOULD HAVE CHANGES IN YOUR REPO FOR THIS SCRIPT TO RUN",
    "bgMagentaBright"
  );
  const answer = await select.default({
    message: "Select a choice",
    choices: [
      {
        name: "pushToStageOnly",
        value: "pushToStageOnly",
        description: "Push only to stage branch",
      },
      {
        name: "pushToMasterOnly",
        value: "pushToMasterOnly",
        description: "Push only to master branch",
      },
      {
        name: "pushToBothBranches",
        value: "pushToBothBranches",
        description: "Push to both branches",
      },
    ],
  });
  if (answer === "pushToStageOnly") {
    const onStage = await confirm.default({
      message: "Are you on stage branch?",
    });
    if (!onStage) {
      await branchChanger("stage");
    }
    await addFileAndCommit();
    await pushToStageOnly();
  }
  if (answer === "pushToMasterOnly") {
    const onMaster = await confirm.default({
      message: "Are you on master branch?",
    });
    if (!onMaster) {
      await branchChanger("master");
    }
    await addFileAndCommit();
    await pushToMasterOnly();
  } else {
    const choiceOfPush = await select.default({
      message: "Select a choice to push",
      choices: [
        {
          name: "startFromStage",
          value: "startFromStage",
          description: "Start from stage",
        },
        {
          name: "startFromMaster",
          value: "startFromMaster",
          description: "Start from master",
        },
      ],
    });
    // helo
    if (choiceOfPush === "startFromStage") {
      await branchChanger("stage");
      const a = await addFileAndCommit();
      console.log(a);
      log("Pushing to stage branch");

      await execCommand("git push -u origin stage");
      log("Checking out to master");
      await execCommand("git checkout master");
      log("Merging Stage");
      await execCommand("git merge stage");
      log("Pushing to master branch");
      await execCommand("git push -u origin master");
    } else {
      await branchChanger("master");
      const a = await addFileAndCommit();
      console.log(a);
      log("Pushing to master branch");
      await execCommand("git push -u origin master");
      log("Checking out to stage");
      await execCommand("git checkout stage");
      log("Merging Master");
      await execCommand("git merge master");
      log("Pushing to stage branch");
      await execCommand("git push -u origin stage");
    }

    log("Pushing to both branches done! & going back to stage branch");
    await execCommand("git checkout stage");
  }

  log("All process has been done!", "bgBlue");
})();
