const { github, unique, getRandomInt } = require('./utils');

const NODE_ENV = process.env['NODE_ENV'];

async function run(input) {
  let event;
  try {
    event = JSON.parse(input.eventJson);
  } catch (e) {
    throw new Error('Set "event-json" correctly using event of pull request workflow.');
  }

  if (!event.action || !event.pull_request) {
    throw new Error('Use this action in "pull_request" workflow, or, set "event-json" correctly using event of pull request workflow.');
  }

  await setAssignees(input, event);
  await setReviewers(input, event);
  await postReadyComment(input, event);
  await postMergedComment(input, event);
}

async function setAssignees(input, event) {
  if (!input.assignees) return;
  if (event.action != 'opened') return;
  const upperTitle = event.pull_request.title.toUpperCase();
  if (upperTitle.includes('SKIP ASSIGN') || upperTitle.includes('ASSIGN SKIP')) return;

  const allAssignees = input.assignees.replace(/\s/g, '').split(',');

  const excludeAssignees = input.excludeAssignees.replace(/\s/g, '').split(',');

  const assignees = allAssignees.filter(assignee => !excludeAssignees.includes(assignee));

  if (assignees.length == 0) return;

  if (NODE_ENV != 'local') {
    await github.setAssignees(event, input.githubToken, assignees);
  }

  console.log(`Set assignees: ${assignees.join(' ')}`);
}

async function setReviewers(input, event) {
  if (!input.reviewers) return;
  if (event.action != 'opened' &&event.action != 'ready_for_review' && event.action != 'edited') return;
  const upperTitle = event.pull_request.title.toUpperCase();
  if (upperTitle.includes('SKIP ASSIGN') || upperTitle.includes('ASSIGN SKIP')) return;
  if (event.pull_request.state != 'open') return; // for edit
  if (event.pull_request.draft) return;
  const upperDraftKeyword = input.draftKeyword.toUpperCase();
  if (upperDraftKeyword && event.pull_request.title.toUpperCase().includes(upperDraftKeyword)) return;
  if (event.action == 'edited' && !(upperDraftKeyword && event.changes.title && event.changes.title.from.toUpperCase().includes(upperDraftKeyword))) return;

  const allReviewers = input.reviewers.replace(/\s/g, '').split(',');

  const author = event.pull_request.user.login;

  const reviewers = allReviewers.filter(reviewer => reviewer != author);

  if (reviewers.length == 0) return;

  const maxNumOfReviewers = parseInt(input.maxNumOfReviewers);

  while(maxNumOfReviewers && maxNumOfReviewers < reviewers.length) {
    reviewers.splice(getRandomInt(reviewers.length), 1);
  }

  if (NODE_ENV != 'local') {
    await github.setReviewers(event, input.githubToken, reviewers);
  }

  console.log(`Set reviewers: ${reviewers.join(' ')}`);
}

async function postReadyComment(input, event) {
  if (!input.readyComment) return;
  if (event.action != 'ready_for_review' && event.action != 'edited') return;
  if (event.pull_request.state != 'open') return; // for edit
  if (event.pull_request.draft) return;
  const upperDraftKeyword = input.draftKeyword.toUpperCase();
  if (upperDraftKeyword && event.pull_request.title.toUpperCase().includes(upperDraftKeyword)) return;
  if (event.action == 'edited' && !(upperDraftKeyword && event.changes.title && event.changes.title.from.toUpperCase().includes(upperDraftKeyword))) return;

  const requestedReviewers = await github.getRequestedReviewers(event, input.githubToken);

  const reviewers = requestedReviewers.map(reviewer => reviewer.login);

  if (reviewers.length == 0) return;

  const reviewersStr = reviewers.map(reviewer => `@${reviewer}`).join(' ');

  const comment = input.readyComment.replace(/<reviewers>/g, reviewersStr);

  if (!comment) return;

  if (NODE_ENV != 'local') {
    await github.postComment(event, input.githubToken, comment);
  }

  console.log(`Comment: ${comment}`);
}

async function postMergedComment(input, event) {
  if (!input.mergedComment) return;
  if (event.action != 'closed') return;
  if (!event.pull_request.merged) return;

  const reviews = await github.getReviews(event, input.githubToken);

  const allReviewers = unique(reviews.map(review => review.user.login));

  // Current specifications, `authors` is the author of the pull request, so comment out
  // const commits = await github.getCommits(event, input.githubToken);
  // const authors = unique(commits.map(commit => commit.author.login));

  const authors = [event.pull_request.user.login];

  const reviewers = allReviewers.filter(reviewer => !authors.includes(reviewer));

  if (reviewers.length == 0) return;

  const reviewersStr = reviewers.map(reviewer => `@${reviewer}`).join(' ');

  const comment = input.mergedComment.replace(/<reviewers>/g, reviewersStr);

  if (!comment) return;

  if (NODE_ENV != 'local') {
    await github.postComment(event, input.githubToken, comment);
  }

  console.log(`Comment: ${comment}`);
}

module.exports = run;
