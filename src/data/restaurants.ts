import { Restaurant } from '../types';

export const PARTNER_RESTAURANTS: Restaurant[] = [
  {
    id: 'la-cocina',
    name: 'La Cocina',
    cuisine: 'Mexican',
    address: '123 Kirkwood Ave, Bloomington, IN',
    latitude: 39.1653,
    longitude: -86.5264,
    radiusMeters: 80,
    rewardLabel: 'Free churros',
    stampsRequired: 3,
    description: 'Neighborhood favorite for tacos and mezcal.',
  },
  {
    id: 'vineyard-table',
    name: 'Vineyard Table',
    cuisine: 'Wine bar',
    address: '456 S Walnut St, Bloomington, IN',
    latitude: 39.1612,
    longitude: -86.5341,
    radiusMeters: 75,
    rewardLabel: 'Glass of house wine',
    stampsRequired: 4,
    description: 'Small plates and natural wines in a cozy room.',
  },
  {
    id: 'sobremesa-demo',
    name: 'Sobremesa Demo Zone',
    cuisine: 'Test partner',
    address: 'Demo location (simulator friendly)',
    latitude: 37.3349,
    longitude: -122.009,
    radiusMeters: 100,
    rewardLabel: '10% off your meal',
    stampsRequired: 2,
    description: 'Use the simulate button on Home to test the full flow.',
  },
];

export function getRestaurant(id: string): Restaurant | undefined {
  return PARTNER_RESTAURANTS.find((r) => r.id === id);
}
