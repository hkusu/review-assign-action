# Review Assign Action

Automatically set assignees and reviewers in pull request.

## Inputs

All inputs for this action are **optional**, so use only the inputs you want to use.

### `assignees`

Accounts to automatically set to assignees when the pull request is opened(`opened` event subscription required), eg `foo, bar`. Specify accounts that have permission to access the repository. Not set if the title contains `skip assign` or `assign skip` keywords. If you want to specify the author of the pull request, specify `${{ github.actor}}`. Bot accounts are excluded.

### `reviewers`

Accounts to automatically set to reviewers when the pull request is opened(`opened` event subscription required), eg `foo, bar`. In case of draft pull requests, set when draft is released(`ready_for_review` event subscription required). Specify accounts that have permission to access the repository. Not set if the title contains `skip assign` or `assign skip` keywords. Does not support team reviewers, so set them manually when creating the pull request.
    
### `max-num-of-reviewers`

If this number is specified, reviewers are randomly selected less than the specified number. Useful for randomly assigning.
    
### `draft-keyword`

A keyword in the pull request title to treat as draft pull requests(`edited` event subscription required), eg `wip`. Case insensitive. Only one can be specified.

### `ready-comment`

Comment to reviewers that the review is ready. The specified comment will be posted when the pull request is opened or the draft is released(`opened` and `ready_for_review` events subscription required). Not posted if reviewers are not set. The `<reviewers>` keyword in the comment is replaced with the review-requested accounts, like `@foo @bar`.

### `merged-comment`

Comment to reviewers that the pull request is merged. The specified comment will be posted when the pull request is merged(`closed` event subscription required). Not posted if the review has not been submitted. The `<reviewers>` keyword in the comment is replaced with the accounts that submitted the review, like `@foo @bar`. Bot accounts are excluded.

### `bot-accounts`

Accounts excluded from assignees etc, eg `foo, bar`. Account names that end with `[bot]` are implicitly recognized as bots, even if not specified, such as `dependabot[bot]`.

### `github-token`

Specify when overriding default GitHub token. Used when running as another user.

## Outputs

### `result`

`success` or `failure` is set. Use it to reference the result of this action in subsequent steps.

## Usage

### Basic usage

Automatically set assignees and reviewers in pull request.

```yaml
name: Review Assign

on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: hamkiti/review-assign-action@v1
        with:
          assignees: ${{ github.actor }} # assign pull request author
          reviewers: foo, bar, baz # if draft, assigned when draft is released
```

If you want to skip assign on a particular pull request, include `skip assign` or `assign skip` keywords in the pull request title.

To randomly select reviewers:

```yaml
max-num-of-reviewers: 2
```

To avoid setting assignees for bot-generated pull requests:

```yaml
bot-accounts: foo-bot, bar-bot
```

Account names that end with `[bot]` are implicitly recognized as bots, even if not specified, such as `dependabot[bot]`.

### Comments to reviewers

The specified comments will be posted.

```yaml
name: Review Assign

on:
  pull_request:
    types: [opened, ready_for_review, closed] # when using 'merged-comment', 'closed' event subscription required

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: hamkiti/review-assign-action@v1
        with:
          ready-comment: 'Ready for review :rocket:' # if there are reviewers, posted when opened or draft is released
          merged-comment: 'It was merged. Thanks for your review :wink:' # if reviewed, posted when merged
```

#### Mention to reviewers

`<reviewers>` keyword is replaced with the accounts like `@foo @bar`.


```yaml
ready-comment: 'Ready for review :rocket: <reviewers>'
merged-comment: 'It was merged. Thanks for your review :wink: <reviewers>'
```

##### *NOTE:* 

- In `ready-comment` .. `<reviewers>` is replaced with the review-requested accounts
- In `merged-comment` .. `<reviewers>` is replaced with the accounts that submitted the review

If you don't want to mention, use inline code with back quotes.

```yaml
ready-comment: 'Ready for review :rocket: `<reviewers>`'
merged-comment: 'It was merged. Thanks for your review :wink: `<reviewers>`'
```

### wip(work in process) support

Specify a keyword in the pull request title to treat as draft pull requests.

```yaml
name: Review Assign

on:
  pull_request:
    types: [opened, ready_for_review, edited] # 'edited' event subscription required

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: hamkiti/review-assign-action@v1
        with:
          reviewers: foo, bar, baz
          draft-keyword: wip # specify keyword(case insensitive).
```

### Result of action

Use `result` outputs.

```yaml
name: Review Assign

on:
  pull_request:
    types: [opened]

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: hamkiti/review-assign-action@v1
        id: assign # specify id
        with:
          assignees: ${{ github.actor }}
      - name: Show result
        if: always()
        run: echo '${{ steps.assign.outputs.result }}' # success or failure
```

### How to switch depending on the content of the pull request?

Control with the workflow of GitHub Actions, for example:

```yaml
name: Review Assign

on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - if: github.base_ref == 'master' # base branch name is 'master'
        run: echo REVIEWERS=foo >> $GITHUB_ENV
      - if: startsWith(github.base_ref, 'develop_') # base branch name starts with 'develop_'
        run: echo REVIEWERS=bar >> $GITHUB_ENV
      - if: startsWith(github.event.pull_request.title, 'bug') # title starts with 'bug'
        run: echo REVIEWERS=foo, baz >> $GITHUB_ENV
      - if: contains(github.event.pull_request.body, 'enhancement') # body contains 'enhancement'
        run: echo REVIEWERS=foo, bar, baz >> $GITHUB_ENV
      - uses: hamkiti/review-assign-action@v1
        with:
          assignees: ${{ github.actor }}
          reviewers: ${{ env.REVIEWERS }}
```

See also below.

- [Workflow syntax for GitHub Actions](https://docs.github.com/en/free-pro-team@latest/actions/reference/workflow-syntax-for-github-actions)
- [Context and expression syntax for GitHub Actions](https://docs.github.com/en/free-pro-team@latest/actions/reference/context-and-expression-syntax-for-github-actions)

## License

MIT
