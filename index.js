const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const axios = require("axios");
const btoa = require("btoa");
const fs = require("fs");
const uuidv4 = require("uuid").v4;

// all github actions
const { Octokit } = require("@octokit/rest");
const octokit = new Octokit({
  auth: process.env.PERSONAL_ACCESS_TOKEN,
});

// create a repository -- tested
const createRepository = async (project_name) => {
  return octokit.rest.repos.createInOrg({
    org: "coot-common-suite",
    name: project_name,
    auto_init: true,
    private: true,
  });
};

// get ref
const getRef = async (project_name, branch) => {
  let ref_response = await octokit.rest.git.getRef({
    owner: "coot-common-suite",
    repo: project_name,
    ref: `heads/${branch}`,
  });
  return ref_response.data.object.sha;
};

// get a tree
const getCommit = async (project_name, commit_sha) => {
  let commit_resp = await octokit.rest.git.getCommit({
    owner: "coot-common-suite",
    repo: project_name,
    commit_sha,
  });
  return commit_resp.data;
};

// create a blob

const createBlob = async (project_name, content) => {
  let blob_response = await octokit.rest.git.createBlob({
    owner: "coot-common-suite",
    repo: project_name,
    content,
    encoding: "utf-8",
  });
  return blob_response.data.sha;
};

// create a tree
const createTree = async (project_name, blobs, paths, base_tree) => {
  const tree = blobs.map((sha, index) => ({
    path: paths[index],
    mode: `100644`,
    type: `blob`,
    sha,
  }));
  const tree_response = await octokit.git.createTree({
    owner: "coot-common-suite",
    repo: project_name,
    tree,
    base_tree,
  });
  return tree_response.data.sha;
};

// create a commit
const createCommit = async (project_name, tree, latest_commit) => {
  let commit_resp = await octokit.rest.git.createCommit({
    owner: "coot-common-suite",
    repo: project_name,
    message: uuidv4(),
    tree,
    parents: [latest_commit],
  });
  return commit_resp.data.sha;
};

// push changes to branch
const pushChangesToBranch = async (project_name, branch, sha) => {
  return await octokit.git.updateRef({
    owner: "coot-common-suite",
    repo: project_name,
    ref: `heads/${branch}`,
    sha,
  });
};

// createRepository("test").then((_) => {
//   console.log(_);
// });

// getCommitsTree("test_02", "1591cda0854662f1174ffa2e1ee885988353951e")
//   .then((_) => {
//     console.log(_); //ad1eec81fc333bf8246911933e26339f38cca52a
//   })
//   .catch((er) => console.log(er));

// createBlob("test", fs.readFileSync(__dirname + "/views/index.html").toString())
//   .then(async (_) => {
//     let blobs = [_];
//     let paths = ["index.html"];
//     let last_commit = await getRef("test", "main");
//     let currentCommit = await getCommit("test", last_commit);
//     let currentTreeSHA = currentCommit.tree.sha;
//     let latest_commit = currentCommit.sha;
//     let newTreeSha = await createTree("test", blobs, paths, currentTreeSHA);
//     let newCommitSha = await createCommit("test", newTreeSha, latest_commit);
//     console.log(await pushChangesToBranch("test", "main", newCommitSha));
//   })
//   .catch((err) => console.log(err));

// retrieve specific file from repository
const getFiles = async (project_name, path, commit) => {
  let files_resp = await octokit.rest.repos.getContent({
    owner: "coot-common-suite",
    repo: project_name,
    path: path,
    ref: commit,
  });
  return Buffer.from(files_resp.data.content, "base64").toString("utf-8");
};

let startTime = Date.now();

// getFiles("test_02", "index.html", "ef207a7b07bfb00f00179f287490c720894b585d")
//   .then((_) => {
//     let endTime = Date.now();
//     console.log(
//       _,
//       "Time Taken to get the file: " + (endTime - startTime) / 1000 + "s"
//     );
//   })
//   .catch((err) => console.log(err));

// getCommit("temp-test", "0339fa430c73c2a2fccde97bf2b7a0d3b421cef7").then((_) =>
//   console.log(_)
// );
