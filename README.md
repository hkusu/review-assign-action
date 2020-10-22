# Review Assign Action

Automatically set assignees and reviewers on pull requests.

## Inputs

### `assignees`

Accounts to automatically set to assignees when the pull request is opened(`opened` event required), eg `foo, bar`. Specify accounts that have permission to access the repository. Not set if the title contains `skip assign` or `assign skip` keywords. If you want to specify the author of the pull request, specify `${{ github.actor}}`.

### `exclude-assignees`

Accounts that does not automatically set to assignees, eg `foo bar`. Specify bot accounts when assignees is specified as `${{ github.actor}}`.

### `reviewers`

Accounts to automatically set to reviewers when the pull request is opened(`opened` event required), eg `foo, bar`. In case of draft pull requests, set when draft is released(`ready_for_review` event required). Specify accounts that have permission to access the repository. Not set if the title contains `skip assign` or `assign skip` keywords. Does not support team reviewers, so set them manually when creating the pull request.
    
### `max-num-of-reviewers`

If this number is specified, reviewers are randomly selected below the specified number.
    
### `draft-keyword`

A keyword in the pull request title to treat as draft pull requests(`edited` event required), eg `wip`. Case insensitive.

### `ready-comment`

Notify reviewers that ready for review. If specified, the specified comment will be posted when the draft is released(`ready_for_review` event required). Not posted if reviewers are not set. The `<reviewers>` keyword in the comment is replaced with the review-requested accounts, like `@foo @bar`.

### `merged-comment`

Notify reviewers that pull request is merged. If specified, the specified comment will be posted when the pull request is merged(`closed` event required). Not posted if the review has not been submitted. The `<reviewers>` keyword in the comment is replaced with the accounts that submitted the review, like `@foo @bar`.

### `github-token`

Specify when overriding default GitHub token. Used when running as another user.

### `event-json`

Specify when overriding GitHub events. (Normally not used.)
    
## Outputs

### `result`

`success` or `failure` is set. Use it to reference the result of this action in subsequent steps.

## Usage

### Basic usage

```yaml
name: Review Assign

on:
  pull_request:
    types: [opened, ready_for_review]

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: hkusu/review-assign-action@v0.1.0
        with:
          assignees: ${{ github.actor }}
          reviewers: foo, bar, baz
```

If you want to skip assign on a particular pull request, include `skip assign` or `assign skip` keywords in the pull request title.

### All inputs are optional

Use only the inputs you want to use.

```yaml
name: Review Assign

on:
  pull_request:
    types: [opened]

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: hkusu/review-assign-action@v0.1.0
        with:
          assignees: ${{ github.actor }} # use only assignees assignments
```

### Don't set bot account to assignees

```yaml
exclude-assignees: dependabot[bot], foo-bot # specify any bot accounts
```

### Comments for reviewers

```yaml
name: Review Assign

on:
  pull_request:
    types: [opened, ready_for_review, closed] # when using 'merged-comment', 'closed' event is required

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: hkusu/review-assign-action@v0.1.0
        with:
          ready-comment: 'Ready for Review :rocket:' # if there are reviewers, posted when draft is released
          merged-comment: 'Thanks for your review :smiley:' # if reviewed, posted when merged
```

#### Mention to reviewers

`<reviewers>` keyword is replaced with the accounts like `@foo @bar`.


```yaml
ready-comment: 'Ready for Review :rocket: <reviewers>'
merged-comment: 'Thanks for your review :smiley: <reviewers>'
```

##### *NOTE:* 

- In `ready-comment` .. `<reviewers>` is replaced with the review-requested accounts
- In `merged-comment` .. `<reviewers>` is replaced with the accounts that submitted the review

If you don't want to mention, use inline code with back quotes.

```yaml
ready-comment: 'Ready for Review :rocket: `<reviewers>`'
merged-comment: 'Thanks for your review :smiley: `<reviewers>`'
```

### wip(work in process) support

```yaml
name: Review Assign

on:
  pull_request:
    types: [opened, ready_for_review, edited] # 'edited' event required

jobs:
  assign:
    runs-on: ubuntu-latest
    steps:
      - uses: hkusu/review-assign-action@v0.1.0
        with:
          reviewers: foo, bar, baz
          draft-keyword: wip # specify keyword(case insensitive, only one can be specified).
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
      - uses: hkusu/review-assign-action@v0.1.0
        id: assign # specify id
        with:
          assignees: ${{ github.actor }}
      - name: Show result
        if: always()
        run: echo '${{ steps.assign.outputs.result }}' # success or failure
```

## License

MIT
