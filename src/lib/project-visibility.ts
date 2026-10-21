/** Suppress preview examples when the site is prepared for public launch. */
export function visibleProjects<T extends { fictional: boolean }>(projects: T[], publicLaunch: boolean): T[] {
  return publicLaunch ? projects.filter(project => !project.fictional) : projects;
}
