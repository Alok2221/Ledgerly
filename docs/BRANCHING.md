# Branches and releases

How we work in this repository. Same layout as the “Na Czas” project.

---

## Three levels

| Branch | Meaning | Deployment |
|---|---|---|
| `main` | **Production.** Only what is released and working | target: production Docker / Compose |
| `develop` | Integration. Finished features waiting for release | target: staging (ST) |
| `feature/*` | Single feature or fix | nowhere |

**ST and production environments do not exist yet**, and the repo may not have a
remote. `develop` is therefore the holding area before a release. Local
`docker compose` is for day-to-day work.

---

## Flow

```
feature/name  ──►  develop  ──►  main  ──►  release + tag
```

**New feature**

```bash
git checkout develop
git checkout -b feature/short-description
# work, commits (author = repo owner, no Cursor / AI Co-Authored-By)
git checkout develop && git merge --no-ff feature/short-description
```

When a remote exists: `git pull` before creating the branch and
`git push origin develop` after merging.

`--no-ff` is intentional: the merge stays as one history point.

**Release**

```bash
git checkout main && git merge --no-ff develop
git tag app-v<version>
```

**Hotfix on production**

```bash
git checkout -b hotfix/description main
# fix
git checkout main && git merge --no-ff hotfix/description && git tag app-v<version>
git checkout develop && git merge --no-ff hotfix/description   # so it does not come back
```

---

## Rules

**No direct commits on `main`.** Everything arrives via merge from `develop` or a hotfix branch.

**Tests / build pass before merging into `develop`**, not before the release.
Check backend (Java 21) and frontend (Angular) separately per the README.

**Database migrations ship with the feature** that needs them, first on local / ST, then production.

**Tags are created on `main` only, never on `develop`.**

**Git history shows only you as commit author** - no Cursor and no AI `Co-Authored-By` footers.

**Commit messages and application copy are English.**
