const axios = require('axios');

const API_BASE_URL = 'https://api.github.com/repos';

async function setAssignees(event, token, assignees) {
  try {
    await axios({
      method: 'post',
      url: `${API_BASE_URL}/${event.repository.full_name}/issues/${event.pull_request.number}/assignees`,
      data: {
        assignees: assignees,
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`,
      },
    });
  } catch(e) {
    throw new Error(createErrorMessage(e));
  }
}

async function setReviewers(event, token, reviewers) {
  try {
    await axios({
      method: 'post',
      url: `${API_BASE_URL}/${event.repository.full_name}/pulls/${event.pull_request.number}/requested_reviewers`,
      data: {
        reviewers: reviewers,
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`,
      },
    });
  } catch(e) {
    throw new Error(createErrorMessage(e, '"github-token" or "reviewers" may not be correct. For "reviewers", specify accounts that have permission to access the repository.'));
  }
}

async function getRequestedReviewers(event, token) {
  let requestedReviewers;
  try {
    // usually there is no problem, so ignore 30 or more
    const res = await axios({
      url: `${API_BASE_URL}/${event.repository.full_name}/pulls/${event.pull_request.number}/requested_reviewers`,
      headers: {
        'Authorization': `token ${token}`,
      },
    });
    requestedReviewers = res.data.users;
  } catch (e) {
    throw new Error(createErrorMessage(e));
  }
  return requestedReviewers;
}

async function postComment(event, token, comment) {
  try {
    await axios({
      method: 'post',
      url: `${API_BASE_URL}/${event.repository.full_name}/issues/${event.pull_request.number}/comments`,
      data: {
        body: comment,
      },
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `token ${token}`,
      },
    });
  } catch(e) {
    throw new Error(createErrorMessage(e));
  }
}

async function getReviews(event, token) {
  let reviews;
  try {
    // TODO paging
    const res = await axios({
      url: `${API_BASE_URL}/${event.repository.full_name}/pulls/${event.pull_request.number}/reviews?page=1&per_page=100`,
      headers: {
        'Authorization': `token ${token}`,
      },
    });
    reviews = res.data;
  } catch (e) {
    throw new Error(createErrorMessage(e));
  }
  return reviews;
}

async function getCommits(event, token) {
  let commits;
  try {
    // TODO paging
    const res = await axios({
      url: `${API_BASE_URL}/${event.repository.full_name}/pulls/${event.pull_request.number}/commits?page=1&per_page=100`,
      headers: {
        'Authorization': `token ${token}`,
      },
    });
    commits = res.data;
  } catch (e) {
    throw new Error(createErrorMessage(e));
  }
  return commits;
}

function createErrorMessage(e, hint) {
  let message = `GitHub API error (message: ${e.message}).`;
  if (!hint) {
    message = `${message} "github-token" may not be correct.`; // default hint
  } else {
    message = `${message} ${hint}`;
  }
  return message;
}

function unique(array) {
  return Array.from(new Set(array));
}

function getRandomInt(i) {
  return Math.floor(Math.random() * i);
}

module.exports = {
  github: {
    setAssignees: setAssignees,
    setReviewers: setReviewers,
    getRequestedReviewers: getRequestedReviewers,
    postComment: postComment,
    getReviews: getReviews,
    getCommits: getCommits,
  },
  unique: unique,
  getRandomInt: getRandomInt,
};
