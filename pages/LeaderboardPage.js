
import React, { useState, useEffect } from 'react';
import { User, ClimbLog } from '../types';
import { getUsersFromLocalStorage, getClimbsFromLocalStorage } from '../utils/localStorageHelper';
import { calculateTotalUserScore } from '../utils/scoringHelper';
import Card from '../components/Card.js';
import LoadingSpinner from '../components/LoadingSpinner.js';
import { TrophyIcon } from '../components/icons.js';

interface LeaderboardEntry {
  user: User;
  totalScore: number;
  rank: number;
}

const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    setIsLoading(true);
    const users = getUsersFromLocalStorage();
    const allClimbs = getClimbsFromLocalStorage();

    const rankedUsers: Omit<LeaderboardEntry, 'rank'>[] = users.map(user => ({
      user,
      totalScore: calculateTotalUserScore(user.id, allClimbs),
    }));

    rankedUsers.sort((a, b) => b.totalScore - a.totalScore);
    
    const finalLeaderboard = rankedUsers.map((entry, index) => ({
        ...entry,
        rank: index + 1,
    }));

    setLeaderboard(finalLeaderboard);
    setIsLoading(false);
  }, []);

  if (isLoading) {
    return <div className="text-center py-10"><LoadingSpinner /> <p>Loading leaderboard...</p></div>;
  }

  return (
    <Card title="Global Leaderboard">
      {leaderboard.length > 0 ? (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-750">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Rank</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">User ID</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Score</th>
              </tr>
            </thead>
            <tbody className="bg-gray-800 divide-y divide-gray-700">
              {leaderboard.map((entry) => (
                <tr key={entry.user.id} className="hover:bg-gray-700 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-100">
                    {entry.rank === 1 && <TrophyIcon className="h-5 w-5 inline-block mr-2 text-yellow-400" />}
                    {entry.rank === 2 && <TrophyIcon className="h-5 w-5 inline-block mr-2 text-gray-400" />}
                    {entry.rank === 3 && <TrophyIcon className="h-5 w-5 inline-block mr-2 text-orange-400" />}
                    {entry.rank}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-200">{entry.user.userId}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-emerald-400">{entry.totalScore} pts</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="text-gray-400">No users or climbs yet. Be the first to make your mark!</p>
      )}
    </Card>
  );
};

export default LeaderboardPage;