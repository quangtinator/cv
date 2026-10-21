# Deployment and staging

The existing public portfolio is hosted on GitHub Pages. Production uses `/cv/`; staging uses `/cv/staging/`. The V4 web portfolio is included at `v4/` within each site. The SSH server itself needs separate server hosting.

Production promotion requires a successful staging deployment of the exact staging commit.

For a future hosting setup, create an issue first, implement on its issue branch, add separate staging/production configuration, test staging, then promote through a pull request. Never put deployment credentials in Git.
