/**
 * Identifies which gameplay system a *solid* Matter body belongs to.
 * Hazards are handled by AABB checks in the level runtime (not Matter bodies),
 * so the only solid labels are the player and platform-like colliders.
 */
export type BodyLabel = 'player' | 'platform';
