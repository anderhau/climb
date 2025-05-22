import React, { useState, useEffect, FormEvent } from 'react';
import Card from '../../components/Card';
import { BoulderSet } from '../../types';
import { 
    getSetsFromLocalStorage, 
    addSetToLocalStorage, 
    activateSetInLocalStorage,
    updateSetInLocalStorage,
    deleteSetFromLocalStorage,
    getBouldersFromLocalStorage
} from '../../utils/localStorageHelper';
import { PlusCircleIcon, CheckCircleIcon, EditIcon, TrashIcon, XCircleIcon } from '../../components/icons';
import LoadingSpinner from '../../components/LoadingSpinner';

type FormMode = 'create' | 'edit';

const AdminManageSetsPage: React.FC = () => {
  const [sets, setSets] = useState<BoulderSet[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Form state
  const [formMode, setFormMode] = useState<FormMode>('create');
  const [showForm, setShowForm] = useState<boolean>(false);
  const [currentSet, setCurrentSet] = useState<Partial<BoulderSet>>({}); // For editing

  const [formName, setFormName] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');


  const displayFeedback = (message: string, type: 'success' | 'error') => {
    setFeedback({ message, type });
    setTimeout(() => setFeedback(null), 4000);
  };

  const fetchSets = () => {
    setSets(getSetsFromLocalStorage());
  };

  useEffect(() => {
    fetchSets();
  }, []);

  const openCreateForm = () => {
    setFormMode('create');
    setFormName('');
    setFormDescription('');
    setCurrentSet({});
    setShowForm(true);
  };

  const openEditForm = (set: BoulderSet) => {
    setFormMode('edit');
    setFormName(set.name);
    setFormDescription(set.description || '');
    setCurrentSet(set);
    setShowForm(true);
  };

  const handleFormSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      displayFeedback("Set name cannot be empty.", 'error');
      return;
    }
    setIsLoading(true);

    if (formMode === 'create') {
      addSetToLocalStorage({ name: formName, description: formDescription });
      displayFeedback("New set created successfully!", 'success');
    } else if (formMode === 'edit' && currentSet.id) {
      updateSetInLocalStorage({ 
        ...currentSet, 
        name: formName, 
        description: formDescription 
      } as BoulderSet);
      displayFeedback(`Set "${formName}" updated successfully!`, 'success');
    }

    resetForm();
    fetchSets();
    setIsLoading(false);
  };
  
  const resetForm = () => {
    setShowForm(false);
    setFormName('');
    setFormDescription('');
    setCurrentSet({});
  }

  const handleActivateSet = (setId: string) => {
    setIsLoading(true);
    activateSetInLocalStorage(setId);
    fetchSets();
    setIsLoading(false);
    displayFeedback("Set activated successfully!", 'success');
  };

  const handleDeleteSet = (set: BoulderSet) => {
    if (set.isActive) {
        displayFeedback("Cannot delete an active set. Deactivate it first.", 'error');
        return;
    }
    if (window.confirm(`Are you sure you want to delete the set "${set.name}"? This action cannot be undone.`)) {
        setIsLoading(true);
        const result = deleteSetFromLocalStorage(set.id);
        if (result.success) {
            displayFeedback(result.message || "Set deleted successfully!", 'success');
            fetchSets();
        } else {
            displayFeedback(result.message || "Failed to delete set.", 'error');
        }
        setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold text-emerald-400">Manage Boulder Sets</h1>
        <button
          onClick={showForm ? resetForm : openCreateForm}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500 transition-colors"
        >
          {showForm && formMode === 'create' ? <XCircleIcon className="h-5 w-5 mr-2" /> : <PlusCircleIcon className="h-5 w-5 mr-2" />}
          {showForm && formMode === 'create' ? 'Cancel Create' : 'Create New Set'}
        </button>
      </div>

      {feedback && (
        <div className={`p-3 rounded-md text-sm ${feedback.type === 'success' ? 'bg-green-600/30 text-green-200' : 'bg-red-600/30 text-red-200'}`}>
          {feedback.message}
        </div>
      )}

      {showForm && (
        <Card title={formMode === 'create' ? "Create New Boulder Set" : `Edit Set: ${currentSet.name}`}>
          <form onSubmit={handleFormSubmit} className="space-y-4">
            <div>
              <label htmlFor="setName" className="block text-sm font-medium text-gray-300 mb-1">Set Name</label>
              <input
                type="text" id="setName" value={formName} onChange={(e) => setFormName(e.target.value)} required
                className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-700 text-gray-100"
              />
            </div>
            <div>
              <label htmlFor="setDescription" className="block text-sm font-medium text-gray-300 mb-1">Description (Optional)</label>
              <textarea
                id="setDescription" value={formDescription} onChange={(e) => setFormDescription(e.target.value)} rows={3}
                className="block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 focus:outline-none focus:ring-emerald-500 focus:border-emerald-500 sm:text-sm bg-gray-700 text-gray-100"
              />
            </div>
            <div className="flex space-x-3">
              <button
                type="submit" disabled={isLoading}
                className="flex-1 justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-emerald-500 disabled:bg-emerald-800"
              >
                {isLoading ? <LoadingSpinner /> : (formMode === 'create' ? 'Create Set' : 'Save Changes')}
              </button>
              <button
                type="button" onClick={resetForm}
                className="flex-1 justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-300 bg-gray-700 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-gray-500"
              >
                Cancel
              </button>
            </div>
          </form>
        </Card>
      )}

      <Card title="Existing Boulder Sets">
        {sets.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead className="bg-gray-750">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-gray-800 divide-y divide-gray-700">
                {sets.map(set => (
                  <tr key={set.id}>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-100">{set.name}</td>
                    <td className="px-4 py-3 whitespace-normal text-sm text-gray-300 max-w-xs">{set.description || '-'}</td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm">
                      {set.isActive ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-700 text-green-100">
                          <CheckCircleIcon className="h-4 w-4 mr-1" /> Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-gray-200">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-sm font-medium space-x-2">
                      {!set.isActive && (
                        <button
                          onClick={() => handleActivateSet(set.id)}
                          disabled={isLoading}
                          className="text-emerald-400 hover:text-emerald-300 disabled:text-gray-500 transition-colors"
                          title="Make Active"
                        >
                          <CheckCircleIcon className="h-5 w-5"/>
                        </button>
                      )}
                       <button
                          onClick={() => openEditForm(set)}
                          disabled={isLoading}
                          className="text-blue-400 hover:text-blue-300 disabled:text-gray-500 transition-colors"
                          title="Edit Set"
                        >
                          <EditIcon className="h-5 w-5"/>
                        </button>
                        {!set.isActive && ( // Only allow deleting inactive sets
                           <button
                              onClick={() => handleDeleteSet(set)}
                              disabled={isLoading}
                              className="text-red-400 hover:text-red-300 disabled:text-gray-500 transition-colors"
                              title="Delete Set"
                            >
                              <TrashIcon className="h-5 w-5"/>
                            </button>
                        )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400">No boulder sets found. Create one to get started!</p>
        )}
      </Card>
    </div>
  );
};

export default AdminManageSetsPage;