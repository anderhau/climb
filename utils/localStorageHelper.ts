import { User, ClimbLog, BoulderSet, Boulder } from '../types';
import { 
  LOCAL_STORAGE_KEYS, 
  INITIAL_BOULDERS, 
  INITIAL_SETS, 
  ADMIN_USER_ID_VAL, 
  ADMIN_USER,
  SECOND_DUMMY_USER_ID_VAL,
  SECOND_DUMMY_USER,
  GRADE_BASE_POINTS
} from '../constants';
import { generateId } from './idGenerator';
import { calculateClimbScore } from './scoringHelper';

// Generic function to get data from localStorage
export const getFromLocalStorage = <T,>(key: string, defaultValue: T | null = null): T | null => {
  try {
    const item = window.localStorage.getItem(key);
    return item ? JSON.parse(item) as T : defaultValue;
  } catch (error) {
    console.error(`Error reading from localStorage key "${key}":`, error);
    return defaultValue;
  }
};

// Generic function to save data to localStorage
export const saveToLocalStorage = <T,>(key: string, value: T): void => {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.error(`Error writing to localStorage key "${key}":`, error);
  }
};

// User specific functions
export const getUsersFromLocalStorage = (): User[] => {
  return getFromLocalStorage<User[]>(LOCAL_STORAGE_KEYS.USERS, []) || [];
};

export const addUserToLocalStorage = (user: User): void => {
  const users = getUsersFromLocalStorage();
  
  let userToAdd = { ...user }; // Work with a copy

  // Ensure predefined users always use their fixed IDs and correct admin/membership status
  if (userToAdd.userId === ADMIN_USER.userId) {
    userToAdd.id = ADMIN_USER.id;
    userToAdd.isAdmin = true;
    userToAdd.membershipType = ADMIN_USER.membershipType;
    userToAdd.membershipExpiryDate = ADMIN_USER.membershipExpiryDate;
    userToAdd.passesLeft = ADMIN_USER.passesLeft;
  } else if (userToAdd.userId === SECOND_DUMMY_USER.userId) {
    userToAdd.id = SECOND_DUMMY_USER.id;
    userToAdd.isAdmin = false; // Explicitly set for clarity
    userToAdd.membershipType = SECOND_DUMMY_USER.membershipType;
    userToAdd.membershipExpiryDate = SECOND_DUMMY_USER.membershipExpiryDate;
    userToAdd.passesLeft = SECOND_DUMMY_USER.passesLeft;
  }
  
  if (users.some(u => u.userId === userToAdd.userId && u.id !== userToAdd.id)) {
    console.warn(`User with UserID ${userToAdd.userId} already exists with a different internal ID. Consider merging or reviewing data. Skipping add of new version.`);
    return;
  }
  
  const finalUsers = users.filter(u => u.id !== userToAdd.id); 
  finalUsers.push(userToAdd);
  saveToLocalStorage(LOCAL_STORAGE_KEYS.USERS, finalUsers);
};


// ClimbLog specific functions
export const getClimbsFromLocalStorage = (): ClimbLog[] => {
  return getFromLocalStorage<ClimbLog[]>(LOCAL_STORAGE_KEYS.CLIMBS, []) || [];
};

export const addClimbToLocalStorage = (climb: ClimbLog): void => {
  const climbs = getClimbsFromLocalStorage();
  climbs.push(climb);
  saveToLocalStorage(LOCAL_STORAGE_KEYS.CLIMBS, climbs);
};

// --- Boulder Set Management ---
export const getSetsFromLocalStorage = (): BoulderSet[] => {
  let sets = getFromLocalStorage<BoulderSet[]>(LOCAL_STORAGE_KEYS.SETS);
  if (sets === null) { 
    sets = [...INITIAL_SETS].map(s => ({...s})); // Deep copy
    saveToLocalStorage(LOCAL_STORAGE_KEYS.SETS, sets);
  }
  return sets;
};

export const addSetToLocalStorage = (newSetData: Omit<BoulderSet, 'id' | 'isActive'>): BoulderSet => {
  const sets = getSetsFromLocalStorage();
  const createdSet: BoulderSet = { ...newSetData, id: generateId(), isActive: false };
  sets.push(createdSet);
  saveToLocalStorage(LOCAL_STORAGE_KEYS.SETS, sets);
  return createdSet;
};

export const updateSetInLocalStorage = (updatedSet: BoulderSet): void => {
  let sets = getSetsFromLocalStorage();
  sets = sets.map(s => s.id === updatedSet.id ? updatedSet : s);
  saveToLocalStorage(LOCAL_STORAGE_KEYS.SETS, sets);
};

export const activateSetInLocalStorage = (setIdToActivate: string): void => {
  let sets = getSetsFromLocalStorage();
  sets = sets.map(s => ({
    ...s,
    isActive: s.id === setIdToActivate,
  }));
  saveToLocalStorage(LOCAL_STORAGE_KEYS.SETS, sets);
};

export const deleteSetFromLocalStorage = (setIdToDelete: string): { success: boolean; message?: string } => {
  let sets = getSetsFromLocalStorage();
  const boulders = getBouldersFromLocalStorage();

  const setToDelete = sets.find(s => s.id === setIdToDelete);
  if (!setToDelete) {
    return { success: false, message: 'Set not found.' };
  }
  if (setToDelete.isActive) {
    return { success: false, message: 'Cannot delete an active set. Deactivate it first.' };
  }

  const bouldersInSet = boulders.filter(b => b.setId === setIdToDelete);
  if (bouldersInSet.length > 0) {
    return { success: false, message: `Cannot delete set "${setToDelete.name}" as it contains ${bouldersInSet.length} boulder(s). Remove or reassign them first.` };
  }

  sets = sets.filter(s => s.id !== setIdToDelete);
  saveToLocalStorage(LOCAL_STORAGE_KEYS.SETS, sets);
  return { success: true, message: `Set "${setToDelete.name}" deleted successfully.` };
};


export const getActiveSetFromLocalStorage = (): BoulderSet | undefined => {
  const sets = getSetsFromLocalStorage();
  return sets.find(s => s.isActive);
};

export const getSetByIdFromLocalStorage = (setId: string) : BoulderSet | undefined => {
  return getSetsFromLocalStorage().find(s => s.id === setId);
}

// --- Boulder Management ---
export const getBouldersFromLocalStorage = (): Boulder[] => {
  let boulders = getFromLocalStorage<Boulder[]>(LOCAL_STORAGE_KEYS.BOULDERS);
  if (boulders === null) { 
    boulders = [...INITIAL_BOULDERS].map(b => ({...b})); // Deep copy
    saveToLocalStorage(LOCAL_STORAGE_KEYS.BOULDERS, boulders);
  }
  return boulders;
};

export const addBoulderToLocalStorage = (newBoulderData: Omit<Boulder, 'id'>): Boulder => {
  const boulders = getBouldersFromLocalStorage();
  const newBoulder: Boulder = { ...newBoulderData, id: generateId() };
  boulders.push(newBoulder);
  saveToLocalStorage(LOCAL_STORAGE_KEYS.BOULDERS, boulders);
  return newBoulder;
};

export const updateBoulderInLocalStorage = (updatedBoulder: Boulder): void => {
  let boulders = getBouldersFromLocalStorage();
  // Recalculate basePoints if grade changed
  const existingBoulder = boulders.find(b => b.id === updatedBoulder.id);
  if (existingBoulder && existingBoulder.grade !== updatedBoulder.grade) {
      updatedBoulder.basePoints = GRADE_BASE_POINTS[updatedBoulder.grade];
  }
  boulders = boulders.map(b => b.id === updatedBoulder.id ? updatedBoulder : b);
  saveToLocalStorage(LOCAL_STORAGE_KEYS.BOULDERS, boulders);
};

export const deleteBoulderFromLocalStorage = (boulderIdToDelete: string): { success: boolean; message?: string } => {
  let boulders = getBouldersFromLocalStorage();
  const boulderToDelete = boulders.find(b => b.id === boulderIdToDelete);
  if (!boulderToDelete) {
    return { success: false, message: 'Boulder not found.'};
  }
  boulders = boulders.filter(b => b.id !== boulderIdToDelete);
  saveToLocalStorage(LOCAL_STORAGE_KEYS.BOULDERS, boulders);
  
  // Optional: Consider if related climb logs should be handled (e.g., marked as 'deleted_boulder' or removed)
  // For now, they will remain but might point to a non-existent boulder.

  return { success: true, message: `Boulder "${boulderToDelete.name}" deleted successfully.` };
};

export const getBoulderByIdFromLocalStorage = (boulderId: string): Boulder | undefined => {
  return getBouldersFromLocalStorage().find(b => b.id === boulderId);
}


// --- Initialization and Dummy Data ---
const initializeAdminUser = () => {
  const users = getUsersFromLocalStorage();
  let adminUser = users.find(u => u.userId === ADMIN_USER_ID_VAL);

  if (!adminUser) {
    addUserToLocalStorage({...ADMIN_USER}); 
  } else {
    // Ensure admin user always has correct admin status and membership details from constants
    let needsUpdate = false;
    if (adminUser.id !== ADMIN_USER.id) {
      adminUser.id = ADMIN_USER.id;
      needsUpdate = true;
    }
    if (!adminUser.isAdmin) {
      adminUser.isAdmin = true;
      needsUpdate = true;
    }
    if (adminUser.membershipType !== ADMIN_USER.membershipType || 
        adminUser.membershipExpiryDate !== ADMIN_USER.membershipExpiryDate ||
        adminUser.passesLeft !== ADMIN_USER.passesLeft) {
      adminUser.membershipType = ADMIN_USER.membershipType;
      adminUser.membershipExpiryDate = ADMIN_USER.membershipExpiryDate;
      adminUser.passesLeft = ADMIN_USER.passesLeft;
      needsUpdate = true;
    }
    if (needsUpdate) {
      addUserToLocalStorage(adminUser); // This will overwrite the existing entry with the corrected one
    }
  }
};

const initializeSecondDummyUser = () => {
  const users = getUsersFromLocalStorage();
  let secondDummy = users.find(u => u.userId === SECOND_DUMMY_USER_ID_VAL);

  if (!secondDummy) {
    addUserToLocalStorage({...SECOND_DUMMY_USER});
  } else {
    // Ensure second dummy user always has correct status and membership details
    let needsUpdate = false;
    if (secondDummy.id !== SECOND_DUMMY_USER.id) {
      secondDummy.id = SECOND_DUMMY_USER.id;
      needsUpdate = true;
    }
    if (secondDummy.isAdmin) { // Should not be admin
      secondDummy.isAdmin = false;
      needsUpdate = true;
    }
     if (secondDummy.membershipType !== SECOND_DUMMY_USER.membershipType || 
        secondDummy.membershipExpiryDate !== SECOND_DUMMY_USER.membershipExpiryDate ||
        secondDummy.passesLeft !== SECOND_DUMMY_USER.passesLeft) {
      secondDummy.membershipType = SECOND_DUMMY_USER.membershipType;
      secondDummy.membershipExpiryDate = SECOND_DUMMY_USER.membershipExpiryDate;
      secondDummy.passesLeft = SECOND_DUMMY_USER.passesLeft;
      needsUpdate = true;
    }
    if (needsUpdate) {
      addUserToLocalStorage(secondDummy);
    }
  }
};

const populateDummyClimbsForUser = (
  user: User, 
  initializedFlagKey: string,
  logPrefix: string
) => {
  const climbLogDummyDataInitialized = getFromLocalStorage<boolean>(initializedFlagKey, false);
  if (climbLogDummyDataInitialized) {
    return;
  }

  const climbs = getClimbsFromLocalStorage();
  const userClimbs = climbs.filter(c => c.userId === user.id);

  if (userClimbs.length > 0) {
    saveToLocalStorage(initializedFlagKey, true);
    return;
  }

  const newDummyClimbs: ClimbLog[] = [];
  const allSets = getSetsFromLocalStorage(); 
  const allBoulders = getBouldersFromLocalStorage();
  
  const inactiveSets = allSets.filter(s => !s.isActive);

  inactiveSets.forEach((set, setIndex) => {
    const bouldersInSet = allBoulders.filter(b => b.setId === set.id);
    for (let i = 0; i < Math.min(bouldersInSet.length, 2); i++) { 
      const boulder = bouldersInSet[i];
      const tries = (i % 3) + 1; 
      const score = calculateClimbScore(boulder.basePoints, tries);
      let dateCompleted = new Date();
      dateCompleted.setDate(dateCompleted.getDate() - (setIndex * 7 + i * 2 + 5));

      newDummyClimbs.push({
        id: generateId(),
        userId: user.id,
        boulderId: boulder.id,
        boulderName: boulder.name,
        boulderGrade: boulder.grade,
        tries,
        score,
        dateCompleted: dateCompleted.toISOString(),
      });
    }
  });

  if (newDummyClimbs.length > 0) {
    newDummyClimbs.forEach(climb => addClimbToLocalStorage(climb));
    console.log(`${logPrefix}: Added ${newDummyClimbs.length} dummy climbs for user ${user.userId}`);
  }
  saveToLocalStorage(initializedFlagKey, true);
};


const initializeAdminDummyClimbLogs = () => {
  let admin = getUsersFromLocalStorage().find(u => u.id === ADMIN_USER.id && u.isAdmin);
  if (!admin) {
    console.warn("Admin user not found. Cannot initialize admin dummy climb logs yet.");
    initializeAdminUser(); 
    admin = getUsersFromLocalStorage().find(u => u.id === ADMIN_USER.id && u.isAdmin);
    if (!admin) {
        console.error("Failed to initialize or find admin user for dummy climbs.");
        return;
    }
  }
  populateDummyClimbsForUser(admin, LOCAL_STORAGE_KEYS.CLIMB_LOG_ADMIN_DUMMY_DATA_INITIALIZED, "AdminClimbs");
};

const initializeSecondDummyClimbLogs = () => {
  let secondUser = getUsersFromLocalStorage().find(u => u.id === SECOND_DUMMY_USER.id && !u.isAdmin);
   if (!secondUser) {
    console.warn("Second dummy user not found. Cannot initialize their dummy climb logs yet.");
    initializeSecondDummyUser();
    secondUser = getUsersFromLocalStorage().find(u => u.id === SECOND_DUMMY_USER.id && !u.isAdmin);
    if (!secondUser) {
        console.error("Failed to initialize or find second dummy user for dummy climbs.");
        return;
    }
  }
  populateDummyClimbsForUser(secondUser, LOCAL_STORAGE_KEYS.CLIMB_LOG_SECOND_DUMMY_DATA_INITIALIZED, "SecondUserClimbs");
};


const initializeCoreData = () => {
  if (getFromLocalStorage(LOCAL_STORAGE_KEYS.USERS) === null) {
    saveToLocalStorage(LOCAL_STORAGE_KEYS.USERS, []);
  }
  getSetsFromLocalStorage(); 
  getBouldersFromLocalStorage();
  
  initializeAdminUser();
  initializeSecondDummyUser(); 

  initializeAdminDummyClimbLogs(); 
  initializeSecondDummyClimbLogs(); 
};

initializeCoreData();