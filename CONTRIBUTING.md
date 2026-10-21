# Delivery workflow

1. Create a GitHub issue describing the problem, scope and acceptance tests before implementation.
2. Branch from `staging`: `git switch staging`, `git pull --ff-only`, then `git switch -c issue/<number>-description`.
3. Implement and run the project checks in `.github/workflows/ci.yml`. Add behavior tests when changing behavior.
4. Push the issue branch and open a pull request into `staging`. Include `Closes #<number>` in its description.
5. Merge only after CI and review pass. For deployed projects, verify the separate staging deployment and record its URL and test evidence.
6. Open a promotion pull request from `staging` into `main`, carrying the issue reference and staging evidence. Merge after required checks pass.
7. Production deployment follows a successful `main` build. Verify production and retain the prior deployment for recovery.

Use `main` for production-ready source and `staging` for pre-production integration. Do not push fixes directly to either branch, force-push shared history, bypass tests or claim that a build artifact is a live deployment. A promotion closes the linked issue on GitHub when it reaches the default branch.

See [deployment status](docs/DELIVERY.md). New repositories are private. Configure server-side branch protections where the account plan supports them; workflow checks still run on pull requests when protection is unavailable.

Repository: https://github.com/quangtinator/cv
Initial setup: https://github.com/quangtinator/cv/issues/1
