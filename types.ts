export enum BoulderGrade {
  V0 = "V0", V1 = "V1", V2 = "V2", V3 = "V3", V4 = "V4",
  V5 = "V5", V6 = "V6", V7 = "V7", V8 = "V8", V9 = "V9", V10 = "V10"
}

export interface User {
  id: string; // Unique identifier for the user object itself
  userId: string; // Username, should be unique among users
  password?: string; // Store hashed password in a real app
  isAdmin?: boolean; // Added for admin privileges
  membershipType?: 'pass_based' | 'time_based' | 'none'; // Type of membership
  passesLeft?: number; // For pass_based memberships
  membershipExpiryDate?: string; // ISO string for time_based memberships
}

export interface BoulderSet {
  id: string; // Unique identifier for the set
  name: string;
  description?: string;
  isActive: boolean;
}

export interface Boulder {
  id: string; // Must be globally unique across all sets and all boulders
  setId: string; // Foreign key to BoulderSet.id
  name: string;
  grade: BoulderGrade;
  basePoints: number;
  imageUrl?: string; // Optional URL for the boulder's image
}

export interface ClimbLog {
  id: string; // Unique identifier for the log entry
  userId: string; // Foreign key to User.id (user object's unique id)
  boulderId: string; // Foreign key to Boulder.id (globally unique boulder id)
  boulderName: string; // Denormalized for easier display
  boulderGrade: BoulderGrade; // Denormalized for easier display
  // setId could be added here if frequent filtering by set is needed on climb logs directly
  // but can also be derived by looking up boulderId -> boulderDetails -> setId
  tries: number;
  score: number;
  dateCompleted: string; // ISO string format
}