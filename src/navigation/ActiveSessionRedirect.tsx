import { useEffect, useRef } from 'react';
import { useNavigation } from '@react-navigation/native';
import { RootNav } from '../../App';
import { useApp } from '../context/AppContext';

/** Sends users back to Locked when a persisted session is in progress. */
export default function ActiveSessionRedirect() {
  const navigation = useNavigation<RootNav>();
  const { activeSession, account, onboarded } = useApp();
  const redirected = useRef(false);

  useEffect(() => {
    if (!account || !onboarded || !activeSession) {
      redirected.current = false;
      return;
    }
    if (redirected.current) return;
    redirected.current = true;
    navigation.reset({
      index: 1,
      routes: [{ name: 'Home' }, { name: 'Locked' }],
    });
  }, [account, onboarded, activeSession, navigation]);

  return null;
}
