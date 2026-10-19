# Ala-Too (Ала-Тоо)

A static restaurant website for a Kyrgyz restaurant, with a working order cart, a Node.js build step, an Nginx container and a GitHub Actions pipeline. No frameworks.

All copy (story, hours, contact details) is **placeholder content**. No real address or phone number is included. Dish pictures are original SVG illustrations, not photographs.

## Project layout

| File | Purpose |
| --- | --- |
| `index.html`, `styles.css`, `script.js`, `favicon.svg` | The website |
| `build.js` | Builds `dist/` (copies files, adds content hashes to CSS/JS names) |
| `package.json`, `package-lock.json` | Tooling (ESLint, HTMLHint) and scripts |
| `.htmlhintrc`, `eslint.config.js` | Lint configuration |
| `Dockerfile`, `nginx.conf`, `.dockerignore` | Multi-stage image: Node builds, Nginx serves on port 80 |
| `sonar-project.properties` | SonarQube configuration |
| `.github/workflows/ci.yml` | CI pipeline |

## First-time setup

Requires Node.js 20.11 or newer.

```bash
npm install      # first time only: creates package-lock.json, commit it
npm ci           # clean, reproducible install (used by CI and Docker)
npm run lint
npm run build
```

> **Important:** `package-lock.json` must be generated with `npm install` on a machine with registry access and committed. `npm ci`, the Dockerfile and CI all require it.

Preview the build locally:

```bash
python3 -m http.server 8080 --directory dist
```

## Docker

```bash
docker build -t ala-too .
docker run --rm -p 8080:80 ala-too
# open http://localhost:8080  (health check: /healthz)
```

## Customizing

- **Tax rate:** `TAX_RATE` at the top of `script.js` (default 8%).
- **Menu and prices:** the `MENU` array in `script.js` (prices are in cents).
- **Photos:** the dish pictures are drawn in `script.js`. To use real photos, add image files to the build (extend `plainAssets` in `build.js`) and swap the `buildArt` call for an `<img>` element.
- **Hours, address, phone, map:** the `#visit` section of `index.html`.
- **Order button:** it is a demo and sends nothing. Connect it to your ordering or payment system.

## GitHub Actions setup

The workflow runs on pull requests and on pushes to `main`. Jobs: `lint`, `build`, `sonarqube`, `trivy`, `docker`, and `publish-ecr`.

`publish-ecr` runs only on a push to `main`, and only after all other jobs succeed.

**Repository secrets** (Settings > Secrets and variables > Actions > Secrets):

| Name | Used by |
| --- | --- |
| `SONAR_TOKEN` | SonarQube scan |
| `SONAR_HOST_URL` | SonarQube scan (for example `https://sonar.example.com`) |
| `AWS_ACCESS_KEY_ID` | ECR publish |
| `AWS_SECRET_ACCESS_KEY` | ECR publish |

**Repository variables** (same page, Variables tab):

| Name | Example |
| --- | --- |
| `AWS_REGION` | `us-east-1` |
| `ECR_REPOSITORY` | `ala-too` |

Also create the ECR repository (name matching `ECR_REPOSITORY`) and a SonarQube project with key `ala-too-restaurant`, or change `sonar.projectKey` in `sonar-project.properties`.

Notes:

- Pull requests from forks cannot read secrets, so the SonarQube job will fail for them.
- Pushing the image uses long-lived access keys as requested. For production, consider switching to GitHub OIDC with an IAM role.
- Action versions are pinned to exact release tags. Bump them periodically.

## Deploying the image

After a successful run on `main`, the image is in ECR tagged with the commit SHA and `latest`. Run it on your platform of choice (ECS, App Runner, EC2) with container port 80 exposed.
