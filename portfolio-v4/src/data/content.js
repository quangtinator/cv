// Single source of truth, shared by the web app and the SSH shell.
// The SSH server (ssh/ssh-server.mjs) reads the same file on Node.
import raw from '../../content.json'

export const site = raw.site
export const stats = raw.stats
export const about = raw.about
export const projects = raw.projects
export const skillGroups = raw.skillGroups
export const coreFocus = raw.coreFocus
export const experience = raw.experience
export const education = raw.education
export const certifications = raw.certifications
export const publication = raw.publication
export const languages = raw.languages
export const navLinks = raw.navLinks
