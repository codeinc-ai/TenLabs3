// src/types/UsageUpdate.ts

/**
 * Represents an update to a user's usage
 */
export interface UsageUpdate {
  userId: string;
  charactersAdded?: number;
  generationsAdded?: number;
}
