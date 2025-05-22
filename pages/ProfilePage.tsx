import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { ClimbLog, BoulderSet } from '../types';
import { 
  getClimbsFromLocalStorage, 
  getSetByIdFromLocalStorage, 
  getBoulderByIdFromLocalStorage,
  getSetsFromLocalStorage
} from '../utils/localStorageHelper';
import { calculateTotalUserScore } from '../utils/scoringHelper';
import Card from '../components/Card';
import LoadingSpinner from '../components/LoadingSpinner';
import { getTriesDisplayString } from '../utils/displayHelper';
import { CalendarIcon, TicketIcon, ShieldExclamationIcon } from '../components/icons'; // Added icons

interface ScoreBySet {
  set: BoulderSet;
  score: number;
}

const ProfilePage: React.FC = () => {
  const { currentUser } = useAuth();
  const [userClimbs, setUserClimbs] = useState<ClimbLog[]>([]);
  const [totalScore, setTotalScore] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [scoresBySet, setScoresBySet] = useState<ScoreBySet[]>([]);

  useEffect(() => {
    if (currentUser) {
      setIsLoading(true);
      const allClimbs = getClimbsFromLocalStorage();
      const allSetsFromStorage = getSetsFromLocalStorage(); // Get all sets for sorting reference

      const currentUserClimbs = allClimbs
        .filter(climb => climb.userId === currentUser.id)
        .sort((a, b) => new Date(b.dateCompleted).getTime() - new Date(a.dateCompleted).getTime());
      
      setUserClimbs(currentUserClimbs);
      setTotalScore(calculateTotalUserScore(currentUser.id, currentUserClimbs));

      const setScoresMap = new Map<string, number>();
      currentUserClimbs.forEach(climb => {
        const boulderDetails = getBoulderByIdFromLocalStorage(climb.boulderId);
        if (boulderDetails) {
          const currentSetScore = setScoresMap.get(boulderDetails.setId) || 0;
          setScoresMap.set(boulderDetails.setId, currentSetScore + climb.score);
        }
      });

      const detailedScoresBySet: ScoreBySet[] = [];
      setScoresMap.forEach((score, setId) => {
        const setDetails = getSetByIdFromLocalStorage(setId);
        if (setDetails) {
          detailedScoresBySet.push({ set: setDetails, score });
        }
      });
      
      detailedScoresBySet.sort((a, b) => {
        const indexOfA = allSetsFromStorage.findIndex(s => s.id === a.set.id);
        const indexOfB = allSetsFromStorage.findIndex(s => s.id === b.set.id);
        // if a set is not in allSetsFromStorage (e.g. old, deleted), put it at the end
        if (indexOfA === -1) return 1;
        if (indexOfB === -1) return -1;
        return indexOfA - indexOfB;
      });

      setScoresBySet(detailedScoresBySet);
      setIsLoading(false);
    }
  }, [currentUser]);

  if (isLoading || !currentUser) {
    return <div className="text-center py-10"><LoadingSpinner /> <p>Loading profile...</p></div>;
  }

  const renderMembershipDetails = () => {
    if (!currentUser.membershipType || currentUser.membershipType === 'none') {
      return (
        <div className="flex items-center text-gray-400">
          <ShieldExclamationIcon className="h-6 w-6 mr-2 text-yellow-500" />
          <p>No active membership.</p>
        </div>
      );
    }

    if (currentUser.membershipType === 'time_based') {
      if (!currentUser.membershipExpiryDate) {
        return <p className="text-gray-400">Membership details incomplete.</p>;
      }
      const expiryDate = new Date(currentUser.membershipExpiryDate);
      const isExpired = expiryDate < new Date();
      return (
        <div className="space-y-2">
          <div className="flex items-center">
            <CalendarIcon className="h-5 w-5 mr-2 text-emerald-400" />
            <p className="text-gray-200">
              Membership Type: <span className="font-semibold">Time-Based</span>
            </p>
          </div>
          <div className="flex items-center">
             <CalendarIcon className={`h-5 w-5 mr-2 ${isExpired ? 'text-red-400' : 'text-emerald-400'}`} />
            <p className={`text-gray-200 ${isExpired ? 'text-red-300' : ''}`}>
              Expires On: <span className="font-semibold">{expiryDate.toLocaleDateString()}</span>
              {isExpired && <span className="ml-2 text-xs font-semibold">(Expired)</span>}
            </p>
          </div>
        </div>
      );
    }

    if (currentUser.membershipType === 'pass_based') {
      if (typeof currentUser.passesLeft !== 'number') {
         return <p className="text-gray-400">Membership details incomplete.</p>;
      }
      return (
        <div className="space-y-2">
           <div className="flex items-center">
            <TicketIcon className="h-5 w-5 mr-2 text-emerald-400" />
            <p className="text-gray-200">
              Membership Type: <span className="font-semibold">Pass-Based</span>
            </p>
          </div>
          <div className="flex items-center">
            <TicketIcon className="h-5 w-5 mr-2 text-emerald-400" />
            <p className="text-gray-200">
              Passes Remaining: <span className="font-semibold">{currentUser.passesLeft}</span>
            </p>
          </div>
        </div>
      );
    }
    return <p className="text-gray-400">Unknown membership type.</p>;
  };


  return (
    <div className="space-y-8">
      <Card title={`${currentUser.userId}'s Profile`}>
        <div className="text-center mb-6">
          <p className="text-gray-400 text-lg">Overall Total Score</p>
          <p className="text-5xl font-bold text-emerald-400">{totalScore} pts</p>
        </div>
      </Card>

      <Card title="Membership Details">
        {renderMembershipDetails()}
      </Card>

      {scoresBySet.length > 0 && (
        <Card title="Score by Set">
          <ul className="space-y-3">
            {scoresBySet.map(item => (
              <li key={item.set.id} className="p-3 bg-gray-700 rounded-md shadow">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-emerald-300">{item.set.name}</p>
                    {item.set.description && <p className="text-xs text-gray-400">{item.set.description}</p>}
                  </div>
                  <p className="text-lg font-bold text-gray-100">{item.score} pts</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      )}

      <Card title="Logged Climbs (All Sets)">
        {userClimbs.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Boulder</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Grade</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Tries</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Date</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {userClimbs.map((climb) => (
                  <tr key={climb.id} className="hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">{climb.boulderName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{climb.boulderGrade}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">{getTriesDisplayString(climb.tries)}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-400">{climb.score} pts</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400">{new Date(climb.dateCompleted).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">You haven't logged any climbs yet. Time to hit the wall!</p>
        )}
      </Card>
    </div>
  );
};

export default ProfilePage;