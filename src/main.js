const core = require('@actions/core');
const run = require('./run');

require('dotenv').config();

const NODE_ENV = process.env['NODE_ENV'];

// Prepare .env file for local execution
const GITHUB_TOKEN = process.env['GITHUB_TOKEN'];

let input;
if (NODE_ENV != 'local') {
  input = {
    assignees: core.getInput('assignees'),
    reviewers: core.getInput('reviewers'),
    maxNumOfReviewers: core.getInput('max-num-of-reviewers'),
    draftKeyword: core.getInput('draft-keyword'),
    readyComment: core.getInput('ready-comment'),
    mergedComment: core.getInput('merged-comment'),
    botAccounts: core.getInput('bot-accounts'),
    githubToken: core.getInput('github-token'),
    event: core.getInput('event'),
  };
} else {
  const event = {
    action: 'opened',
    changes: {
      title: {
        from: 'this is pre title'
      }
    },
    pull_request: {
      draft: false,
      number: 1,
      state: 'open',
      title: 'this is title',
      merged: false,
      user: {
        login: 'hkusu',
      },
    },
    repository: {
      full_name: 'hkusu/review-assign-action',
    },
  };
  input = {
    assignees: 'hkusu',
    reviewers: 'hkusu, foo, bar',
    maxNumOfReviewers: '2',
    draftKeyword: 'wip',
    readyComment: 'Ready for review :rocket: `<reviewers>`',
    mergedComment: 'It was merged. Thanks for your review :wink: `<reviewers>`',
    botAccounts: 'some-bot',
    githubToken: GITHUB_TOKEN,
    event: JSON.stringify(event),
  };
}

run(input)
  .then(() => {
    core.setOutput('result', 'success');
  })
  .catch(error => {
    core.setOutput('result', 'failure');
    core.setFailed(error.message);
  });
