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
