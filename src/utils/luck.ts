import { roll2d6 } from './combat'

export interface LuckTestResult {
  roll: number
  wasLucky: boolean
  originalDamage: number
  modifiedDamage: number
}

/**
 * Test luck by rolling 2d6 and checking if result is <= current luck
 */
export function testLuck(currentLuck: number): { roll: number; wasLucky: boolean } {
  const roll = roll2d6()
  const wasLucky = roll <= currentLuck
  return { roll, wasLucky }
}

/**
 * Modify damage based on luck test result
 * @param type 'reduce' for damage taken by player, 'increase' for damage dealt to enemy
 * @param wasLucky Whether the luck test was successful
 */
export function modifyDamage(type: 'reduce' | 'increase', wasLucky: boolean): number {
  if (type === 'reduce') {
    // Player taking damage - lucky reduces it, unlucky increases it
    return wasLucky ? 1 : 3
  } else {
    // Player dealing damage - lucky increases it, unlucky reduces it
    return wasLucky ? 3 : 1
  }
}

/**
 * Perform a complete luck test and return the result
 */
export function performLuckTest(
  currentLuck: number,
  originalDamage: number,
  type: 'reduce' | 'increase'
): LuckTestResult {
  const { roll, wasLucky } = testLuck(currentLuck)
  const modifiedDamage = modifyDamage(type, wasLucky)
  
  return {
    roll,
    wasLucky,
    originalDamage,
    modifiedDamage
  }
}