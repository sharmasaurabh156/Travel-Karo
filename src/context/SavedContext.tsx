import React, { createContext, useContext, useState, useEffect } from 'react';
import { SavedItem } from '../types';
import { api } from '../lib/api';
import { useAuth } from './AuthContext';

interface SavedContextType {
  savedItems: SavedItem[];
  isSaved: (itemType: SavedItem['itemType'], itemId: string) => boolean;
  toggleSave: (itemType: SavedItem['itemType'], itemId: string, itemData: any) => Promise<boolean>;
  refreshSaved: () => Promise<void>;
}

const SavedContext = createContext<SavedContextType | undefined>(undefined);

export const SavedProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, openAuthModal } = useAuth();
  const [savedItems, setSavedItems] = useState<SavedItem[]>([]);

  const refreshSaved = async () => {
    if (!user) {
      setSavedItems([]);
      return;
    }
    try {
      const res = await api.getSavedItems();
      setSavedItems(res.savedItems || []);
    } catch (err) {
      console.warn('Failed to load saved items:', err);
    }
  };

  useEffect(() => {
    refreshSaved();
  }, [user]);

  const isSaved = (itemType: SavedItem['itemType'], itemId: string): boolean => {
    return savedItems.some(item => item.itemType === itemType && item.itemId === itemId);
  };

  const toggleSave = async (itemType: SavedItem['itemType'], itemId: string, itemData: any): Promise<boolean> => {
    if (!user) {
      openAuthModal('login');
      return false;
    }

    // Optimistic UI update
    const alreadySaved = isSaved(itemType, itemId);
    if (alreadySaved) {
      setSavedItems(prev => prev.filter(i => !(i.itemType === itemType && i.itemId === itemId)));
    } else {
      const tempItem: SavedItem = {
        id: `temp-${Date.now()}`,
        userId: user.id,
        itemType,
        itemId,
        itemData,
        savedAt: new Date().toISOString()
      };
      setSavedItems(prev => [...prev, tempItem]);
    }

    try {
      const result = await api.toggleSavedItem(itemType, itemId, itemData);
      refreshSaved();
      return result.saved;
    } catch (err) {
      console.error('Failed to toggle save:', err);
      refreshSaved();
      return alreadySaved;
    }
  };

  return (
    <SavedContext.Provider value={{ savedItems, isSaved, toggleSave, refreshSaved }}>
      {children}
    </SavedContext.Provider>
  );
};

export const useSaved = () => {
  const context = useContext(SavedContext);
  if (!context) {
    throw new Error('useSaved must be used within a SavedProvider');
  }
  return context;
};
