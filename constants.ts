import { Boulder, BoulderGrade, BoulderSet, User } from './types';

export const APP_NAME = "MoBaz GrimP";

export const BOULDER_GRADES_ORDERED: BoulderGrade[] = [
  BoulderGrade.V0, BoulderGrade.V1, BoulderGrade.V2, BoulderGrade.V3, BoulderGrade.V4,
  BoulderGrade.V5, BoulderGrade.V6, BoulderGrade.V7, BoulderGrade.V8, BoulderGrade.V9, BoulderGrade.V10,
];

export const GRADE_BASE_POINTS: Record<BoulderGrade, number> = {
  [BoulderGrade.V0]: 100,
  [BoulderGrade.V1]: 200,
  [BoulderGrade.V2]: 300,
  [BoulderGrade.V3]: 400,
  [BoulderGrade.V4]: 500,
  [BoulderGrade.V5]: 600,
  [BoulderGrade.V6]: 700,
  [BoulderGrade.V7]: 800,
  [BoulderGrade.V8]: 900,
  [BoulderGrade.V9]: 1000,
  [BoulderGrade.V10]: 1100,
};

// These are now INITIAL SEED DATA if localStorage is empty.
export const INITIAL_SETS: BoulderSet[] = [
  { 
    id: "set1_july_w1_main", 
    name: "July Week 1 - Main Wall", 
    description: "Fresh routes on the main bouldering wall, set on July 1st.",
    isActive: false 
  },
  { 
    id: "set2_july_w2_slab", 
    name: "July Week 2 - Slab Zone", 
    description: "Technical slab problems, set on July 8th.",
    isActive: false 
  },
  { 
    id: "set3_july_w3_cave", 
    name: "July Week 3 - The Cave", 
    description: "Steep and powerful routes in the cave section, set on July 15th.",
    isActive: false 
  },
  {
    id: "set4_july_w4_overhang",
    name: "July Week 4 - The Overhang",
    description: "Challenging overhang routes, set on July 22nd.",
    isActive: true // This is the initially active set in seed data
  }
];

// These are now INITIAL SEED DATA if localStorage is empty.
export const INITIAL_BOULDERS: Boulder[] = [
  // Set 1: July Week 1 - Main Wall (Inactive)
  { id: "s1b1", setId: "set1_july_w1_main", name: "Greenhorn Gully", grade: BoulderGrade.V0, basePoints: GRADE_BASE_POINTS[BoulderGrade.V0], imageUrl: "https://picsum.photos/seed/s1_green_v0/600/400" },
  { id: "s1b2", setId: "set1_july_w1_main", name: "Yellow Submarine", grade: BoulderGrade.V1, basePoints: GRADE_BASE_POINTS[BoulderGrade.V1], imageUrl: "https://picsum.photos/seed/s1_yellow_v1/600/400" },
  { id: "s1b3", setId: "set1_july_w1_main", name: "Blue Streak", grade: BoulderGrade.V2, basePoints: GRADE_BASE_POINTS[BoulderGrade.V2], imageUrl: "httpsum.photos/seed/s1_blue_v2/600/400" },
  { id: "s1b4", setId: "set1_july_w1_main", name: "Red Arête", grade: BoulderGrade.V3, basePoints: GRADE_BASE_POINTS[BoulderGrade.V3], imageUrl: "https://picsum.photos/seed/s1_red_v3/600/400" },

  // Set 2: July Week 2 - Slab Zone (Inactive)
  { id: "s2b1", setId: "set2_july_w2_slab", name: "Slab Easy Start", grade: BoulderGrade.V0, basePoints: GRADE_BASE_POINTS[BoulderGrade.V0], imageUrl: "https://picsum.photos/seed/s2_green_v0/600/400" },
  { id: "s2b2", setId: "set2_july_w2_slab", name: "The Orange Slice", grade: BoulderGrade.V1, basePoints: GRADE_BASE_POINTS[BoulderGrade.V1], imageUrl: "https://picsum.photos/seed/s2_orange_v1/600/400" },
  { id: "s2b3", setId: "set2_july_w2_slab", name: "Purple Haze Slab", grade: BoulderGrade.V2, basePoints: GRADE_BASE_POINTS[BoulderGrade.V2], imageUrl: "https://picsum.photos/seed/s2_purple_v2/600/400" },
  { id: "s2b4", setId: "set2_july_w2_slab", name: "Red Dot Special", grade: BoulderGrade.V3, basePoints: GRADE_BASE_POINTS[BoulderGrade.V3], imageUrl: "https://picsum.photos/seed/s2_red_v3/600/400" },
  
  // Set 3: July Week 3 - The Cave (Inactive)
  { id: "s3b1", setId: "set3_july_w3_cave", name: "Cave Dweller Easy", grade: BoulderGrade.V2, basePoints: GRADE_BASE_POINTS[BoulderGrade.V2], imageUrl: "https://picsum.photos/seed/s3_black_v2/600/400" },
  { id: "s3b2", setId: "set3_july_w3_cave", name: "Bat Hang Traverse", grade: BoulderGrade.V3, basePoints: GRADE_BASE_POINTS[BoulderGrade.V3], imageUrl: "https://picsum.photos/seed/s3_white_v3/600/400" },
  { id: "s3b3", setId: "set3_july_w3_cave", name: "The Project X", grade: BoulderGrade.V4, basePoints: GRADE_BASE_POINTS[BoulderGrade.V4], imageUrl: "https://picsum.photos/seed/s3_gold_v4/600/400" },
  { id: "s3b4", setId: "set3_july_w3_cave", name: "Crimson Pinch", grade: BoulderGrade.V5, basePoints: GRADE_BASE_POINTS[BoulderGrade.V5], imageUrl: "https://picsum.photos/seed/s3_crimson_v5/600/400" },

  // Set 4: July Week 4 - The Overhang (Active in seed data)
  { id: "s4b1", setId: "set4_july_w4_overhang", name: "Easy Roof Escape", grade: BoulderGrade.V3, basePoints: GRADE_BASE_POINTS[BoulderGrade.V3], imageUrl: "https://picsum.photos/seed/s4_blue_v3/600/400" },
  { id: "s4b2", setId: "set4_july_w4_overhang", name: "Orange Power Dyno", grade: BoulderGrade.V4, basePoints: GRADE_BASE_POINTS[BoulderGrade.V4], imageUrl: "https://picsum.photos/seed/s4_orange_v4/600/400" },
  { id: "s4b3", setId: "set4_july_w4_overhang", name: "The White Whale", grade: BoulderGrade.V5, basePoints: GRADE_BASE_POINTS[BoulderGrade.V5], imageUrl: "https://picsum.photos/seed/s4_white_v5/600/400" },
  { id: "s4b4", setId: "set4_july_w4_overhang", name: "Midnight Train", grade: BoulderGrade.V6, basePoints: GRADE_BASE_POINTS[BoulderGrade.V6], imageUrl: "https://picsum.photos/seed/s4_black_v6/600/400" },
];


export const TRIES_BONUS_MULTIPLIERS: Record<number, number> = {
  1: 1.5,  // Flash: +50%
  2: 1.25, // 2 tries: +25%
  3: 1.10, // 3 tries: +10%
}; // 4+ tries will default to 1.0 (no bonus)

export const LOCAL_STORAGE_KEYS = {
  USERS: 'mobazgrimp_users',
  CLIMBS: 'mobazgrimp_climbs',
  LOGGED_IN_USER_ID: 'mobazgrimp_loggedInUserId',
  ADMIN_DATA_INITIALIZED_SETS: 'mobazgrimp_adminDataInitialized_sets_v1', // For seeding sets
  ADMIN_DATA_INITIALIZED_BOULDERS: 'mobazgrimp_adminDataInitialized_boulders_v1', // For seeding boulders
  SETS: 'mobazgrimp_boulderSets',
  BOULDERS: 'mobazgrimp_boulders',
  CLIMB_LOG_ADMIN_DUMMY_DATA_INITIALIZED: 'mobazgrimp_climbLogAdminDummyDataInitialized_v1', // For admin user's climbs
  CLIMB_LOG_SECOND_DUMMY_DATA_INITIALIZED: 'mobazgrimp_climbLogSecondDummyDataInitialized_v1' // For second dummy user's climbs
};

// Admin User
export const ADMIN_USER_ID_VAL = "admin";
export const ADMIN_USER_PASSWORD = "admin";
export const ADMIN_USER_FIXED_ID = "admin-user-01";

export const ADMIN_USER: User = {
  id: ADMIN_USER_FIXED_ID,
  userId: ADMIN_USER_ID_VAL,
  password: ADMIN_USER_PASSWORD,
  isAdmin: true,
  membershipType: 'time_based',
  membershipExpiryDate: new Date(new Date().getFullYear() + 1, 0, 1).toISOString() // Expires Jan 1st next year
};

// Second Dummy User (Non-Admin)
export const SECOND_DUMMY_USER_ID_VAL = "ClimberJane";
export const SECOND_DUMMY_USER_PASSWORD = "password123";
export const SECOND_DUMMY_USER_FIXED_ID = "climber-jane-02";

export const SECOND_DUMMY_USER: User = {
  id: SECOND_DUMMY_USER_FIXED_ID,
  userId: SECOND_DUMMY_USER_ID_VAL,
  password: SECOND_DUMMY_USER_PASSWORD,
  isAdmin: false,
  membershipType: 'pass_based',
  passesLeft: 7,
};