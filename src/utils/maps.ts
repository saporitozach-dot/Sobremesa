import { Linking, Platform } from 'react-native';

export async function openMapsNavigation(
  name: string,
  latitude: number,
  longitude: number,
): Promise<void> {
  const label = encodeURIComponent(name);
  const coords = `${latitude},${longitude}`;

  const candidates = Platform.select({
    ios: [
      `maps://?daddr=${coords}&q=${label}`,
      `https://maps.apple.com/?daddr=${coords}&q=${label}`,
    ],
    android: [
      `google.navigation:q=${coords}`,
      `geo:${coords}?q=${coords}(${label})`,
      `https://www.google.com/maps/dir/?api=1&destination=${coords}`,
    ],
    default: [`https://www.google.com/maps/dir/?api=1&destination=${coords}`],
  })!;

  for (const url of candidates) {
    try {
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
        return;
      }
    } catch {
      // try next option
    }
  }

  await Linking.openURL(
    `https://www.google.com/maps/dir/?api=1&destination=${coords}`,
  );
}
