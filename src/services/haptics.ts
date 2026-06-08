/**
 * Centralised haptics. A plain module (no React) so it can be called from the
 * engine, entities and UI alike. Respects a global on/off flag (driven by
 * settings) and never throws on unsupported platforms.
 *
 * Use the semantic helpers rather than expo-haptics directly so intensity stays
 * consistent across the game.
 */

import * as Haptics from 'expo-haptics';

let enabled = true;

export function setHapticsEnabled(value: boolean): void {
  enabled = value;
}

export function isHapticsEnabled(): boolean {
  return enabled;
}

function safe(run: () => Promise<void>): void {
  if (!enabled) return;
  run().catch(() => {
    /* haptics are best-effort */
  });
}

/** Light tick — jumps, landings, UI selection. */
export const hapticLight = (): void => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));

/** Medium thud — bounce pads, dash, teleport, gravity flip. */
export const hapticMedium = (): void => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium));

/** Heavy hit — crushes, hard impacts. */
export const hapticHeavy = (): void => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy));

/** UI selection tick — button presses. */
export const hapticSelect = (): void => safe(() => Haptics.selectionAsync());

/** Success buzz — level complete. */
export const hapticSuccess = (): void =>
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));

/** Error buzz — death. */
export const hapticError = (): void =>
  safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error));
