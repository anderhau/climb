import React, { useState, useEffect, FormEvent, useMemo } from 'react';
import Card from '../../components/Card';
import { Boulder, BoulderSet, BoulderGrade } from '../../types';
import { 
  getBouldersFromLocalStorage, 
  getSetsFromLocalStorage, 
  addBoulderToLocalStorage,
  updateBoulderInLocalStorage,
  deleteBoulderFromLocalStorage
} from '../../utils/localStorageHelper';
import { BOULDER_GRADES_ORDERED, GRADE_BASE_POINTS } from '../../constants';
import { PlusCircleIcon, EditIcon, TrashIcon, XCircleIcon } from '../../components/icons';
import LoadingSpinner from '../../components/LoadingSpinner';

type FormMode = 'create' | 'edit';

const AdminManageBouldersPage: React.FC = () => {
  const [boulders, setBoulders] = useState<Boulder[]>([]);
  const [sets, setSets] = useState<BoulderSet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [currentBoulder, setCurrentBoulder] = useState<Partial<Boulder>>({}); // For editing

  const [formName, setFormName] = useState<string>('');
  const [formGrade, setFormGrade] = useState<BoulderGrade>(BoulderGrade.V0);
  const [formSetId, setFormSetId] = useState<string>('');
  const [formImageUrl, setFormImageUrl] = useState<string>('');
  
  const [filterSetId, setFilterSetId] = useState<string>('');

  const displayFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchBouldersAndSets = () => {
    setBoulders(getBouldersFromLocalStorage());
    const availableSets = getSetsFromLocalStorage();
    setSets(availableSets);
    if (availableSets.length > 0 && !formSetId && formMode === 'create') {
      setFormSetId(availableSets[0].id); 
    }
  };

  useEffect(() => {
    fetchBouldersAndSets();
  }, []);
  
  const filteredBoulders = useMemo(() => {
    if (!filterSetId) return boulders;
    return boulders.filter(b => b.setId === filterSetId);
  }, [boulders, filterSetId]);

  const resetFormAndState = () => {
    setShowForm(false);
    setFormName('');
    setFormGrade(BoulderGrade.V0);
    setFormSetId(sets.length > 0 ? sets[0].id : '');
    setFormImageUrl('');
    setCurrentBoulder({});
  };

  const openCreateForm = () => {
    if (sets.length === 0) {
        displayFeedback("Please create a Boulder Set first before adding boulders.", "error");
        return;
    }
    setFormMode('create');
    resetFormAndState(); // Resets fields to default for create
    setFormSetId(sets.length > 0 ? sets[0].id : ''); // Ensure a set is selected if available
    setShowForm(true);
  };

  const openEditForm = (boulder: Boulder) => {
    setFormMode('edit');
    setFormName(boulder.name);
    setFormGrade(boulder.grade);
    setFormSetId(boulder.setId);
    setFormImageUrl(boulder.imageUrl || '');
    setCurrentBoulder(boulder);
    setShowForm(true);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formSetId) {
      displayFeedback("Boulder name and selected set cannot be empty.", 'error');
      return;
    }
    setIsLoading(true);

    const boulderData = {
      name: formName,
      grade: formGrade,
      basePoints: GRADE_BASE_POINTS[formGrade],
      setId: formSetId,
      imageUrl: formImageUrl || undefined,
    };

    if (formMode === 'create') {
      addBoulderToLocalStorage(boulderData);
      displayFeedback("New boulder created successfully!", 'success');
    } else if (formMode === 'edit' && currentBoulder.id) {
      updateBoulderInLocalStorage({ ...boulderData, id: currentBoulder.id });
      displayFeedback(`Boulder "${formName}" updated successfully!`, 'success');
    }
    
    resetFormAndState();
    fetchBouldersAndSets();
    setIsLoading(false);
  };

  const handleDeleteBoulder = (boulder: Boulder) => {
    if (window.confirm(`Are you sure you want to delete the boulder "${boulder.name}"? This action cannot be undone.`)) {
        setIsLoading(true);
        const result = deleteBoulderFromLocalStorage(boulder.id);
        if (result.success) {
            displayFeedback(result.message || "Boulder deleted successfully!", 'success');
            fetchBouldersAndSets(); // Refresh list
        } else {
            displayFeedback(result.message || "Failed to delete boulder.", 'error');
        }
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-emerald-400">Manage Boulders</h1>
        <button
          onClick={showForm ? resetFormAndState : openCreateForm}
          disabled={sets.length === 0 && !showForm} // Disable create if no sets, unless form is already open for cancel
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500 disabled:bg-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {showForm && formMode === 'create' ? <XCircleIcon className="h-5 w-5 mr-2" /> : <PlusCircleIcon className="h-5 w-5 mr-2" />}
          {showForm && formMode === 'create' ? 'Cancel Create' : 'Create New Boulder'}
        </button>
      </div>
      
      {sets.length === 0 && !showForm && ( // Only show if not trying to cancel an open form
         <p className="text-yellow-400 bg-yellow-700/20 p-3 rounded-md text-sm">
            Please create a Boulder Set first before adding boulders.
        </p>
      )}

      {feedback && (
        <div className={`p-3 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-600/30 text-green-200' : 'bg-red-600/30 text-red-200'}`}>
          {feedback.message}
        </div>
      )}

      {showForm && (
        <Card title={formMode === 'create' ? "Create New Boulder" : `Edit Boulder: ${currentBoulder.name}`}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="boulderName" className="block text-sm font-medium text-gray-300 mb-1">Boulder Name</label>
              <input
                type="text" id="boulderName" value={formName} onChange={(e) => setFormName(e.target.value)} required
                className="input-style"
              />
            </div>
            <div>
              <label htmlFor="boulderGrade" className="block text-sm font-medium text-gray-300 mb-1">Grade</label>
              <select
                id="boulderGrade" value={formGrade} onChange={(e) => setFormGrade(e.target.value as BoulderGrade)} required
                className="input-style"
              >
                {BOULDER_GRADES_ORDERED.map(grade => (
                  <option key={grade} value={grade}>{grade} ({GRADE_BASE_POINTS[grade]} pts)</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="boulderSet" className="block text-sm font-medium text-gray-300 mb-1">Boulder Set</label>
              <select
                id="boulderSet" value={formSetId} onChange={(e) => setFormSetId(e.target.value)} required
                className="input-style"
                disabled={sets.length === 0}
              >
                {sets.map(set => (
                  <option key={set.id} value={set.id}>{set.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label htmlFor="boulderImageUrl" className="block text-sm font-medium text-gray-300 mb-1">Image URL (Optional)</label>
              <input
                type="url" id="boulderImageUrl" value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="input-style"
              />
            </div>
            <div className="flex space-x-3">
                <button
                    type="submit" disabled={isLoading || (formMode === 'create' && sets.length === 0)}
                    className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500 disabled:bg-gray-500 disabled:cursor-not-allowed"
                >
                    {isLoading ? <LoadingSpinner /> : (formMode === 'create' ? 'Create Boulder' : 'Save Changes')}
                </button>
                <button
                    type="button" onClick={resetFormAndState}
                    className="flex-1 justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
                >
                    Cancel
                </button>
            </div>
          </form>
        </Card>
      )}
      
      <style>{`
        .input-style {
          display: block;
          width: 100%;
          padding-left: 0.75rem; padding-right: 0.75rem; padding-top: 0.5rem; padding-bottom: 0.5rem;
          border-width: 1px; border-color: #4A5568; /* gray-600 */
          border-radius: 0.375rem; /* rounded-md */
          box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); /* shadow-sm */
          background-color: #2D3748; /* gray-700 */
          color: #F7FAFC; /* gray-100 */
        }
        .input-style:focus {
          outline: 2px solid transparent; outline-offset: 2px;
          --tw-ring-color: #34D399; border-color: #34D399;
        }
        .input-style::placeholder { color: #A0AEC0; }
      `}</style>

      <Card title="Existing Boulders">
         <div className="mb-4">
            <label htmlFor="filterSet" className="block text-sm font-medium text-gray-300 mb-1">Filter by Set:</label>
            <select
                id="filterSet" value={filterSetId} onChange={(e) => setFilterSetId(e.target.value)}
                className="input-style max-w-xs"
            >
                <option value="">All Sets</option>
                {sets.map(set => (
                    <option key={set.id} value={set.id}>{set.name}</option>
                ))}
            </select>
        </div>
        {filteredBoulders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750">
                <tr>
                  <th className="th-style">Name</th>
                  <th className="th-style">Grade</th>
                  <th className="th-style">Points</th>
                  <th className="th-style">Set</th>
                  <th className="th-style">Image</th>
                  <th className="th-style">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {filteredBoulders.map(boulder => {
                  const setDetails = sets.find(s => s.id === boulder.setId);
                  return (
                    <tr key={boulder.id}>
                      <td className="td-style text-gray-100">{boulder.name}</td>
                      <td className="td-style">{boulder.grade}</td>
                      <td className="td-style">{boulder.basePoints}</td>
                      <td className="td-style">{setDetails?.name || 'Unknown Set'}</td>
                      <td className="td-style">
                        {boulder.imageUrl ? (
                          <img src={boulder.imageUrl} alt={boulder.name} className="h-10 w-16 object-cover rounded"/>
                        ) : '-'}
                      </td>
                      <td className="td-style space-x-2">
                         <button
                            onClick={() => openEditForm(boulder)}
                            disabled={isLoading}
                            className="text-blue-400 hover:text-blue-300 disabled:text-gray-500 transition-colors"
                            title="Edit Boulder"
                          >
                            <EditIcon className="h-5 w-5"/>
                          </button>
                           <button
                              onClick={() => handleDeleteBoulder(boulder)}
                              disabled={isLoading}
                              className="text-red-400 hover:text-red-300 disabled:text-gray-500 transition-colors"
                              title="Delete Boulder"
                            >
                              <TrashIcon className="h-5 w-5"/>
                            </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            <style>{`
                .th-style {
                    padding: 0.75rem 1rem; text-align: left; font-size: 0.75rem; 
                    font-weight: 500; color: #D1D5DB; text-transform: uppercase; letter-spacing: 0.05em;
                }
                .td-style { padding: 0.75rem 1rem; white-space: nowrap; font-size: 0.875rem; color: #D1D5DB; }
            `}</style>
          </div>
        ) : (
          <p className="text-gray-400">{filterSetId ? 'No boulders found in this set.' : 'No boulders found. Create one to get started!'}</p>
        )}
      </Card>
    </div>
  );
};

export default AdminManageBouldersPage;