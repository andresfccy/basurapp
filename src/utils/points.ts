import type { Pickup } from '../data/pickups'
import type { PointsFormula } from '../config/config-context'

export function calculatePickupPoints(pickup: Pickup, formula: PointsFormula) {
  const base = formula.basePoints[pickup.kind]

  if (pickup.kind === 'inorganicos') {
    const weight = pickup.collectedWeightKg ?? 0
    return Math.max(0, Math.round(base + weight * formula.inorganicWeightMultiplier))
  }

  return Math.max(0, Math.round(base))
}

export function calculateUserPoints(pickups: Pickup[], requesterName: string, formula: PointsFormula) {
  return pickups
    .filter((pickup) => !pickup.archived && pickup.requestedBy === requesterName && pickup.status !== 'rejected')
    .reduce((total, pickup) => total + calculatePickupPoints(pickup, formula), 0)
}
