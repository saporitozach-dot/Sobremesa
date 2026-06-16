import { Restaurant } from '../types';

// Seed partners — Fort Lauderdale (demo) and Durham, NH (UNH area).
export const SAMPLE_RESTAURANTS: Restaurant[] = [
  {
    id: 'r1',
    name: "Louie Bossi's Ristorante",
    cuisine: 'Italian · Bar · Pizza',
    description:
      'Lively Las Olas spot for wood-fired pizza, house-made pasta, and a sprawling bar. A neighborhood favorite for long dinners and post-meal conversation.',
    latitude: 26.1194,
    longitude: -80.1378,
    radius: 60,
    rewardPoints: 100,
    rewardLabel: 'Free cocktail',
  },
  {
    id: 'r2',
    name: "Casa D'Angelo",
    cuisine: 'Fine Italian',
    description:
      'Upscale Italian dining with seasonal seafood, handmade pastas, and an extensive wine list. Quiet enough for a focused, phone-free meal.',
    latitude: 26.1208,
    longitude: -80.1362,
    radius: 55,
    rewardPoints: 100,
    rewardLabel: 'Free cocktail',
  },
  {
    id: 'r3',
    name: "Rocco's Tacos",
    cuisine: 'Mexican · Tequila Bar',
    description:
      'Colorful Mexican cantina serving tacos, guacamole made tableside, and a deep tequila selection. High energy and perfect for groups.',
    latitude: 26.1201,
    longitude: -80.139,
    radius: 60,
    rewardPoints: 120,
    rewardLabel: 'Free cocktail',
  },
  {
    id: 'r4',
    name: "Henry's Sandwich Station",
    cuisine: 'Sandwiches · Wine Bar',
    description:
      'Casual counter-service sandwiches by day, natural wines and small plates by night. Quick bites or a relaxed sit-down on Las Olas.',
    latitude: 26.1185,
    longitude: -80.1385,
    radius: 50,
    rewardPoints: 110,
    rewardLabel: 'Free appetizer',
  },
  {
    id: 'r5',
    name: "Young's Restaurant & Tavern",
    cuisine: 'American · Pub',
    description:
      'Durham institution since 1932 — burgers, comfort food, and a classic New England tavern feel steps from UNH. Always packed after games and finals.',
    latitude: 43.13395,
    longitude: -70.92655,
    radius: 60,
    rewardPoints: 100,
    rewardLabel: 'Free cocktail',
  },
  {
    id: 'r6',
    name: "Libby's Bakery Bar & Bistro",
    cuisine: 'Bakery · Bistro · Bar',
    description:
      'Scratch bakery by morning, bistro and craft cocktails by night. Pastries, salads, and a cozy patio tucked off Main Street.',
    latitude: 43.13541,
    longitude: -70.92872,
    radius: 55,
    rewardPoints: 110,
    rewardLabel: 'Free cocktail',
  },
  {
    id: 'r7',
    name: "Mo's Cafe",
    cuisine: 'Cafe · Breakfast · Lunch',
    description:
      'Neighborhood cafe for omelets, sandwiches, and strong coffee. A low-key spot to linger over brunch without rushing.',
    latitude: 43.13525,
    longitude: -70.92845,
    radius: 50,
    rewardPoints: 90,
    rewardLabel: 'Free appetizer',
  },
  {
    id: 'r8',
    name: 'Wagon Hill Tavern',
    cuisine: 'American · Tavern',
    description:
      'Main Street pub with pub fare, local beers on tap, and a laid-back crowd. Good for a casual phone-free dinner with friends.',
    latitude: 43.13442,
    longitude: -70.92709,
    radius: 55,
    rewardPoints: 100,
    rewardLabel: 'Free cocktail',
  },
];

export function getRestaurantById(id: string): Restaurant | undefined {
  return SAMPLE_RESTAURANTS.find((r) => r.id === id);
}
