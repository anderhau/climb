
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Boulder, BoulderSet, ClimbLog } from '../types';
import { BOULDER_GRADES_ORDERED } from '../constants';
import { 
  addClimbToLocalStorage, 
  getClimbsFromLocalStorage, 
  getActiveSetFromLocalStorage, 
  getBouldersFromLocalStorage,
  getBoulderByIdFromLocalStorage
} from '../utils/localStorageHelper';
import { calculateClimbScore } from '../utils/scoringHelper';
import { generateId } from '../utils/idGenerator';
import Card from '../components/Card.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import { MountainIcon } from '../components/icons.js'; 
import { getTriesDisplayString } from '../utils/displayHelper';

const DashboardPage: React.FC = () => {
  const { currentUser } = useAuth();
  const [selectedBoulderId, setSelectedBoulderId] = useState<string>('');
  const [selectedBoulderImage, setSelectedBoulderImage] = useState<string | null>(null);
  const [tries, setTries] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);
  const [feedbackType, setFeedbackType] = useState<'success' | 'error' | 'info'>('info');
  const [recentClimbs, setRecentClimbs] = useState<ClimbLog[]>([]);
  const [climbedBoulderIds, setClimbedBoulderIds] = useState<Set<string>>(new Set());

  const [activeSet, setActiveSet] = useState<BoulderSet | undefined>(undefined);
  const [allBoulders, setAllBoulders] = useState<Boulder[]>([]);

  useEffect(() => {
    // Load initial data from localStorage
    setActiveSet(getActiveSetFromLocalStorage());
    setAllBoulders(getBouldersFromLocalStorage());
  }, []);


  const activeBoulders = useMemo(() => {
    if (!activeSet) return [];
    return allBoulders.filter(b => b.setId === activeSet.id);
  }, [activeSet, allBoulders]);

  const sortedActiveBoulders = useMemo(() => {
    return [...activeBoulders].sort((a, b) => {
      const gradeAIndex = BOULDER_GRADES_ORDERED.indexOf(a.grade);
      const gradeBIndex = BOULDER_GRADES_ORDERED.indexOf(b.grade);
      if (gradeAIndex !== gradeBIndex) {
        return gradeAIndex - gradeBIndex;
      }
      return a.name.localeCompare(b.name);
    });
  }, [activeBoulders]);

  useEffect(() => {
    if (currentUser) {
      const allUserClimbs = getClimbsFromLocalStorage();
      const userClimbedBoulderIds = new Set(
        allUserClimbs
          .filter(climb => climb.userId === currentUser.id && climb.score > 0)
          .map(climb => climb.boulderId) 
      );
      setClimbedBoulderIds(userClimbedBoulderIds);
    }
  }, [currentUser]);
  
  const fetchRecentClimbs = useCallback(() => {
    if (currentUser) {
      const allUserClimbs = getClimbsFromLocalStorage();
      const userClimbs = allUserClimbs
        .filter(climb => climb.userId === currentUser.id)
        .sort((a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime())
        .slice(0, 3); 
      setRecentClimbs(userClimbs);
    }
  },[currentUser]);
  
  useEffect(() => {
    fetchRecentClimbs();
  }, [fetchRecentClimbs]);


  useEffect(() => {
    if (sortedActiveBoulders.length > 0) {
      const firstUncompletedBoulderInActiveSet = sortedActiveBoulders.find(b => !climbedBoulderIds.has(b.id));
      if (firstUncompletedBoulderInActiveSet) {
        setSelectedBoulderId(firstUncompletedBoulderInActiveSet.id);
      } else if (sortedActiveBoulders.length > 0) {
        setSelectedBoulderId(sortedActiveBoulders[0].id); // Select first one, will be disabled
      } else {
        setSelectedBoulderId(''); 
      }
    } else {
        setSelectedBoulderId(''); 
    }
  }, [sortedActiveBoulders, climbedBoulderIds]);

  useEffect(() => {
    if (selectedBoulderId) {
      const boulder = getBoulderByIdFromLocalStorage(selectedBoulderId); // Use LS getter
      setSelectedBoulderImage(boulder?.imageUrl || null);
    } else {
      setSelectedBoulderImage(null);
    }
  }, [selectedBoulderId]);

  const handleLogClimb = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser || !selectedBoulderId) {
      setFeedbackMessage('Please select a boulder from the active set.');
      setFeedbackType('error');
      return;
    }

    if (climbedBoulderIds.has(selectedBoulderId)) {
      setFeedbackMessage('This boulder has already been completed for points.');
      setFeedbackType('error');
      return;
    }

    setIsLoading(true);
    setFeedbackMessage(null);

    const boulder = getBoulderByIdFromLocalStorage(selectedBoulderId); // Use LS getter
    if (!boulder || !activeSet || boulder.setId !== activeSet.id) { 
      setFeedbackMessage('Selected boulder not found or not in active set.');
      setFeedbackType('error');
      setIsLoading(false);
      return;
    }
    
    const score = calculateClimbScore(boulder.basePoints, tries);
    const message = `Successfully logged "${boulder.name}" for ${score} points!`;
    setFeedbackType('success');
    
    const newClimb: ClimbLog = {
      id: generateId(),
      userId: currentUser.id,
      boulderId: boulder.id,
      boulderName: boulder.name,
      boulderGrade: boulder.grade,
      tries,
      score,
      dateCompleted: new Date().toISOString(),
    };

    await new Promise(resolve => setTimeout(resolve, 500)); 
    
    addClimbToLocalStorage(newClimb);
    setFeedbackMessage(message);
    setIsLoading(false);
    setTries(1); 
    fetchRecentClimbs(); 

    setClimbedBoulderIds(prevIds => new Set(prevIds).add(boulder.id));

    const currentClimbedSet = new Set(climbedBoulderIds).add(boulder.id);
    const nextUncompletedBoulder = sortedActiveBoulders.find(b => !currentClimbedSet.has(b.id));
    
    if (nextUncompletedBoulder) {
        setSelectedBoulderId(nextUncompletedBoulder.id);
    } else if (sortedActiveBoulders.length > 0) {
        setSelectedBoulderId(sortedActiveBoulders[0].id);
    }

    setTimeout(() => setFeedbackMessage(null), 5000);
  };

  if (!currentUser) {
    return <div className="text-center py-10"><LoadingSpinner /> <p>Loading user data...</p></div>;
  }

  if (!activeSet) {
    return (
      <div className="text-center py-10">
        <h1 className="text-3xl font-bold text-yellow-400">No Active Boulder Set</h1>
        <p className="text-gray-300 mt-2">An admin needs to set an active boulder set.</p>
      </div>
    );
  }
  
  const isCurrentSelectedBoulderCompleted = selectedBoulderId ? climbedBoulderIds.has(selectedBoulderId) : false;
  const currentSelectedBoulderDetails = getBoulderByIdFromLocalStorage(selectedBoulderId);


  return (
    <div className="space-y-8">
      <h1 className="text-4xl font-bold text-emerald-400">Welcome, {currentUser.userId}!</h1>
      
      <Card title="Log New Climb">
        <div className="mb-4 p-3 bg-gray-700 rounded-md">
            <h3 className="text-md font-semibold text-emerald-300">Current Active Set: {activeSet.name}</h3>
            {activeSet.description && <p className="text-xs text-gray-400">{activeSet.description}</p>}
        </div>

        {selectedBoulderId && selectedBoulderImage ? (
          <div className="mb-6 rounded-lg overflow-hidden shadow-md aspect-video">
            <img 
              src={selectedBoulderImage} 
              alt={`Image of ${currentSelectedBoulderDetails?.name || 'selected boulder'}`} 
              className="w-full h-full object-cover"
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; /* Basic error handling */ }}
            />
          </div>
        ) : (
          <div className="mb-6 h-48 bg-gray-700 rounded-lg flex flex-col items-center justify-center text-gray-500 shadow-md aspect-video image-placeholder-fallback">
            <MountainIcon className="w-16 h-16" /> 
            <p className="mt-2 text-sm">{activeBoulders.length === 0 ? "No boulders in the current active set." : "Select a boulder to see its image."}</p>
          </div>
        )}

        <form onSubmit={handleLogClimb} className="space-y-4">
          <div>
            <label htmlFor="boulder" className="block text-sm font-medium text-gray-300 mb-1">Select Boulder</label>
            <select
              id="boulder"
              value={selectedBoulderId}
              onChange={(e) => setSelectedBoulderId(e.target.value)}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-gray-700 text-gray-100"
              aria-label="Select Boulder"
              disabled={sortedActiveBoulders.length === 0}
            >
              {sortedActiveBoulders.length === 0 && <option value="" disabled>No boulders available in this set</option>}
              {sortedActiveBoulders.map((b: Boulder) => {
                const isCompleted = climbedBoulderIds.has(b.id);
                return (
                  <option 
                    key={b.id} 
                    value={b.id} 
                    disabled={isCompleted}
                    className={`${isCompleted ? 'text-gray-500 italic' : 'text-gray-100'} ${b.id === selectedBoulderId ? 'bg-gray-600' : ''}`}
                  >
                    {b.grade} - {b.name} ({b.basePoints} pts) {isCompleted ? '(Completed)' : ''}
                  </option>
                );
              })}
            </select>
          </div>
          <div>
            <label htmlFor="tries" className="block text-sm font-medium text-gray-300 mb-1">Number of Tries</label>
            <select
              id="tries"
              value={tries}
              onChange={(e) => setTries(parseInt(e.target.value, 10))}
              className="block w-full pl-3 pr-10 py-2 text-base border-gray-600 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm rounded-md bg-gray-700 text-gray-100"
              aria-label="Number of Tries"
              disabled={isCurrentSelectedBoulderCompleted || !selectedBoulderId || sortedActiveBoulders.length === 0}
            >
              <option value="1">Flash (1 try)</option>
              <option value="2">2 tries</option>
              <option value="3">3 tries</option>
              <option value="4">4+ tries</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={isLoading || isCurrentSelectedBoulderCompleted || !selectedBoulderId || sortedActiveBoulders.length === 0}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
            aria-describedby={isCurrentSelectedBoulderCompleted ? "completed-boulder-info" : undefined}
          >
            {isLoading ? <LoadingSpinner /> : 'Log Climb'}
          </button>
          {isCurrentSelectedBoulderCompleted && selectedBoulderId && (
            <p id="completed-boulder-info" className="mt-2 text-sm text-yellow-500 text-center" role="status">
              This boulder has already been completed for points.
            </p>
          )}
          {feedbackMessage && (
            <p className={`mt-2 text-sm text-center ${
              feedbackType === 'success' ? 'text-green-400' : 
              feedbackType === 'error' ? 'text-red-400' : 
              'text-blue-400'
            }`}
            role="status"
            aria-live="polite"
            >
              {feedbackMessage}
            </p>
          )}
        </form>
      </Card>

      <Card title="Recently Logged Climbs">
        {recentClimbs.length > 0 ? (
          <ul className="space-y-3">
            {recentClimbs.map(climb => (
              <li key={climb.id} className="p-3 bg-gray-700 rounded-md shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-emerald-400">{climb.boulderName} ({climb.boulderGrade})</p>
                    <p className="text-xs text-gray-400">
                      {new Date(climb.dateCompleted).toLocaleDateString()} - {getTriesDisplayString(climb.tries)}
                    </p>
                  </div>
                  <p className="text-lg font-bold text-gray-100">{climb.score} pts</p>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No climbs logged yet. Go send something from the current set!</p>
        )}
      </Card>
    </div>
  );
};

export default DashboardPage;