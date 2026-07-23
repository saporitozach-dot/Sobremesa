import { Platform } from 'react-native';
import * as LiveActivity from 'expo-live-activity';
import { partnerLook } from '../components/PartnerSign';
import { PARTNER_RESTAURANTS } from '../data/restaurants';
import { colors } from '../theme';
import { SessionRecord } from '../types';

let activityId: string | undefined;

/**
 * The deep screen colour rather than the card colour: on a lock screen this sits
 * over the wallpaper, and the darker field is what lets the accent read.
 */
const baseConfig: LiveActivity.LiveActivityConfig = {
  backgroundColor: colors.bg,
  titleColor: colors.text,
  subtitleColor: colors.textMuted,
  progressViewLabelColor: colors.text,
  deepLinkUrl: '/Locked',
  timerType: 'circular',
  padding: { vertical: 18, horizontal: 20 },
  imagePosition: 'right',
  imageAlign: 'center',
  imageSize: { width: 36, height: 36 },
  contentFit: 'contain',
};

/**
 * The timer takes the partner's own accent, so a glance at the lock screen
 * carries the same colour identity as that restaurant's card in the app.
 * Falls back to gold for a restaurant no longer in the partner list.
 */
function accentFor(session: SessionRecord): string {
  const restaurant = PARTNER_RESTAURANTS.find((r) => r.id === session.restaurantId);
  return restaurant ? partnerLook(restaurant).accent : colors.primary;
}

function configFor(session: SessionRecord): LiveActivity.LiveActivityConfig {
  return { ...baseConfig, progressViewTint: accentFor(session) };
}

function goalEndMs(session: SessionRecord): number {
  return new Date(session.startedAt).getTime() + session.goalMinutes * 60 * 1000;
}

function buildState(session: SessionRecord, subtitle?: string): LiveActivity.LiveActivityState {
  return {
    title: session.restaurantName,
    subtitle: subtitle ?? `Phone-down · ${session.goalMinutes} min`,
    progressBar: {
      date: goalEndMs(session),
    },
    imageName: 'sobremesa',
    dynamicIslandImageName: 'sobremesa',
  };
}

export function isSessionLiveActivitySupported(): boolean {
  return Platform.OS === 'ios';
}

export async function startSessionLiveActivity(session: SessionRecord): Promise<void> {
  if (!isSessionLiveActivitySupported()) return;

  try {
    if (activityId) {
      LiveActivity.stopActivity(activityId, buildState(session, 'Session ended'));
      activityId = undefined;
    }

    const id = LiveActivity.startActivity(buildState(session), configFor(session));
    if (typeof id === 'string') {
      activityId = id;
    }
  } catch (error) {
    console.warn('[sessionLiveActivity] start failed', error);
  }
}

export async function stopSessionLiveActivity(
  session?: SessionRecord,
  subtitle = 'Session ended',
): Promise<void> {
  if (!isSessionLiveActivitySupported() || !activityId) return;

  const id = activityId;
  activityId = undefined;

  try {
    const state: LiveActivity.LiveActivityState = session
      ? buildState(session, subtitle)
      : {
          title: 'Sobremesa',
          subtitle,
        };
    LiveActivity.stopActivity(id, state);
  } catch (error) {
    console.warn('[sessionLiveActivity] stop failed', error);
  }
}
