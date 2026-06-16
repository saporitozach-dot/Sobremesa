import { getRestaurantById } from '../data/restaurants';
import {
  MIN_STAMP_MINUTES,
  RedemptionVoucher,
  RestaurantStampBook,
  Session,
  StampAwardResult,
  STAMPS_FOR_REWARD,
} from '../types';

export function todayKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

export function emptyStampBook(restaurantId: string): RestaurantStampBook {
  return {
    restaurantId,
    stamps: 0,
    totalStampsEarned: 0,
    lastStampDate: null,
    redemptionsCount: 0,
  };
}

export function getStampBook(
  books: Record<string, RestaurantStampBook>,
  restaurantId: string,
): RestaurantStampBook {
  return books[restaurantId] ?? emptyStampBook(restaurantId);
}

export function sessionMinutes(session: Session): number {
  const end = session.endedAt ?? Date.now();
  return Math.floor((end - session.startedAt) / 60000);
}

export function evaluateStampAward(
  session: Session,
  book: RestaurantStampBook,
): StampAwardResult {
  if (!session.completed) {
    return { earned: false, reason: 'Session was not completed.' };
  }

  const minutes = sessionMinutes(session);
  if (minutes < MIN_STAMP_MINUTES) {
    return {
      earned: false,
      reason: `Stay phone-free for at least ${MIN_STAMP_MINUTES} minutes to earn a stamp.`,
    };
  }

  if (book.stamps >= STAMPS_FOR_REWARD) {
    return {
      earned: false,
      reason: 'You already have 3 stamps — redeem for a free cocktail.',
    };
  }

  const today = todayKey();
  if (book.lastStampDate === today) {
    return {
      earned: false,
      reason: 'You already earned a stamp here today. One per day.',
    };
  }

  return { earned: true };
}

export function applyStamp(book: RestaurantStampBook): RestaurantStampBook {
  const today = todayKey();
  return {
    ...book,
    stamps: Math.min(STAMPS_FOR_REWARD, book.stamps + 1),
    totalStampsEarned: book.totalStampsEarned + 1,
    lastStampDate: today,
  };
}

export function canRedeem(book: RestaurantStampBook): boolean {
  return book.stamps >= STAMPS_FOR_REWARD;
}

function randomCodeSegment(length: number): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let out = '';
  for (let i = 0; i < length; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

export function generateVoucherCode(restaurantId: string): string {
  const tag = restaurantId.replace('r', '').toUpperCase().padStart(2, '0');
  return `SMR-${tag}-${randomCodeSegment(4)}`;
}

export function redeemStamps(
  book: RestaurantStampBook,
  restaurantName: string,
  serverConfirmedBy: string,
): { book: RestaurantStampBook; voucher: RedemptionVoucher } {
  const restaurant = getRestaurantById(book.restaurantId);
  const voucher: RedemptionVoucher = {
    id: `v-${Date.now()}`,
    restaurantId: book.restaurantId,
    restaurantName,
    code: generateVoucherCode(book.restaurantId),
    rewardLabel: restaurant?.rewardLabel ?? 'Free cocktail',
    serverConfirmedBy,
    issuedAt: Date.now(),
    redeemedAt: null,
    status: 'active',
  };

  return {
    book: {
      ...book,
      stamps: 0,
      redemptionsCount: book.redemptionsCount + 1,
    },
    voucher,
  };
}
