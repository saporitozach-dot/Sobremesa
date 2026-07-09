import { Platform } from 'react-native';
import * as LiveActivity from 'expo-live-activity';
import { colors } from '../theme';
import { SessionRecord } from '../types';

let activityId: string | undefined;

const liveActivityConfig: LiveActivity.LiveActivityConfig = {
  backgroundColor: colors.surface,
  titleColor: colors.text,
  subtitleColor: colors.textMuted,
  progressViewTint: colors.primary,
  progressViewLabelColor: colors.text,
  deepLinkUrl: '/Locked',
  timerType: 'circular',
  imagePosition: 'right',
  imageAlign: 'center',
  imageSize: { width: 40, height: 40 },
  contentFit: 'contain',
};

function goalEndMs(session: SessionRecord): number {
  return new Date(session.startedAt).getTime() + session.goalMinutes * 60 * 1000;
}

function buildState(session: SessionRecord, subtitle?: string): LiveActivity.LiveActivityState {
  return {
    title: session.restaurantName,
    subtitle: subtitle ?? `Phone-down · ${session.goalMinutes} min goal`,
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

    const id = LiveActivity.startActivity(buildState(session), liveActivityConfig);
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
