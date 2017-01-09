# github-projects

Microservice to cache and expose GitHub projects to `/oss` for the
▲ZEIT homepage.

## How to run

```bash
npm start
```

## API

### GET /

**200**: Returns a list of projects as follows

```json
[
  {
    "name": "project-name",
    "description": "The description woot",
    "stars": 3040,
    "url": "https://github.com/zeit/test"
  }
]
```

## Contributing

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your own GitHub account and then [clone](https://help.github.com/articles/cloning-a-repository/) it to your local device
2. Follow the [usage section](#usage)
3. Start making changes and open a pull request once they're ready!

You can use `npm test` to run the tests and see if your changes have broken anything.

## Author

Guillermo Rauch ([@rauchg](https://twitter.com/rauchg)) - [▲ZEIT](https://zeit.co)
