
import React, { useState } from 'react';
import { VocabFolder, VocabWord } from '../types';
import FlashcardModal from './FlashcardModal';
import { PlusIcon, TrashIcon, FolderIcon, PlayIcon, MoveIcon } from './shared/Icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';

const VocabularyView: React.FC = () => {
  const { currentUser, setCurrentUser } = useAuth();
  const folders = currentUser?.folders;
  const { t } = useLanguage();
  
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(folders ? folders[0]?.id : null);
  const [newFolderName, setNewFolderName] = useState('');
  const [showFlashcards, setShowFlashcards] = useState(false);
  const [wordToMove, setWordToMove] = useState<VocabWord | null>(null);

  React.useEffect(() => {
    if (!selectedFolderId && folders && folders.length > 0) {
      setSelectedFolderId(folders[0].id);
    }
  }, [folders, selectedFolderId]);

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500">{t('loading')}</p>
      </div>
    );
  }

  const handleAddFolder = () => {
    if (newFolderName.trim() && setCurrentUser && currentUser) {
      const newFolder: VocabFolder = {
        id: Date.now().toString(),
        name: newFolderName.trim(),
        words: [],
      };
      setCurrentUser({ ...currentUser, folders: [...currentUser.folders, newFolder] });
      setNewFolderName('');
    }
  };

  const handleDeleteFolder = (folderId: string) => {
    if (!folders || !setCurrentUser || !currentUser) return;
    if (folders.length <= 1) {
        alert(t('vocabulary.cannotDeleteLast'));
        return;
    }
    if (window.confirm(t('vocabulary.confirmDeleteFolder'))) {
      const newFolders = folders.filter(f => f.id !== folderId);
      setCurrentUser({ ...currentUser, folders: newFolders });
      if(selectedFolderId === folderId){
          setSelectedFolderId(newFolders[0]?.id || null);
      }
    }
  };

  const handleDeleteWord = (wordId: string) => {
    if (!setCurrentUser || !currentUser) return;

    const updatedFolders = currentUser.folders.map(f => {
      if (f.id === selectedFolderId) {
        return { ...f, words: f.words.filter(w => w.id !== wordId) };
      }
      return f;
    });

    setCurrentUser({ ...currentUser, folders: updatedFolders });
  };
  
  const handleMoveClick = (word: VocabWord) => {
    setWordToMove(word);
  };
  
  const handleMoveWord = (destinationFolderId: string) => {
    if (!wordToMove || !selectedFolderId || !setCurrentUser || !currentUser) return;
    
    const destFolder = currentUser.folders.find(f => f.id === destinationFolderId);
    if (destFolder?.words.some(w => w.word === wordToMove.word)) {
        alert(t('vocabulary.wordExistsInDest'));
        setWordToMove(null);
        return;
    }

    const updatedFolders = currentUser.folders.map(folder => {
        // Remove from source folder
        if (folder.id === selectedFolderId) {
            return { ...folder, words: folder.words.filter(w => w.id !== wordToMove.id) };
        }
        // Add to destination folder
        if (folder.id === destinationFolderId) {
            return { ...folder, words: [...folder.words, wordToMove] };
        }
        return folder;
    });

    setCurrentUser({ ...currentUser, folders: updatedFolders });
    setWordToMove(null);
  };

  const selectedFolder = folders?.find(f => f.id === selectedFolderId);

  return (
    <div className="flex flex-col h-full space-y-4">
      <h2 className="text-3xl font-bold text-center text-[#D72638] mb-4">{t('vocabulary.title', { username: currentUser?.nickname || '' })}</h2>
      
      <div className="flex gap-2">
        <input
          type="text"
          value={newFolderName}
          onChange={(e) => setNewFolderName(e.target.value)}
          placeholder={t('vocabulary.newFolderPlaceholder')}
          className="flex-grow p-3 bg-white border-2 border-red-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-100 focus:border-[#D72638]"
        />
        <button onClick={handleAddFolder} className="p-3 bg-[#D72638] text-white rounded-xl hover:bg-[#b8202f] shadow-sm"><PlusIcon /></button>
      </div>
      
        <div className="border-2 border-red-100 rounded-2xl bg-white shadow-sm p-4 flex-grow overflow-y-auto">
        <h3 className="text-lg font-semibold mb-2 text-[#D72638]">{t('vocabulary.folderList')}</h3>
        <div className="space-y-2">
          {folders && folders.map((folder, idx) => {
            const pastelColors = [
              { bg: 'bg-blue-50', border: 'border-blue-200', hover: 'hover:bg-blue-100' },
              { bg: 'bg-pink-50', border: 'border-pink-200', hover: 'hover:bg-pink-100' },
              { bg: 'bg-yellow-50', border: 'border-yellow-200', hover: 'hover:bg-yellow-100' },
              { bg: 'bg-purple-50', border: 'border-purple-200', hover: 'hover:bg-purple-100' },
              { bg: 'bg-green-50', border: 'border-green-200', hover: 'hover:bg-green-100' },
              { bg: 'bg-orange-50', border: 'border-orange-200', hover: 'hover:bg-orange-100' }
            ];
            const color = pastelColors[idx % pastelColors.length];
            return (
            <div
              key={folder.id}
              onClick={() => setSelectedFolderId(folder.id)}
              className={`flex justify-between items-center p-3 rounded-xl cursor-pointer transition border-2 ${selectedFolderId === folder.id ? `${color.bg} border-[#D72638]` : `bg-white ${color.border} ${color.hover}`}`}
            >
              <div className="flex items-center gap-2">
                <FolderIcon />
                <span className="text-gray-700">{folder.name} ({folder.words.length})</span>
              </div>
              <button onClick={(e) => { e.stopPropagation(); handleDeleteFolder(folder.id);}} className="text-gray-400 hover:text-[#D72638]"><TrashIcon /></button>
            </div>
            );
          })}
        </div>
      </div>
      
      {selectedFolder && (
        <div className="border-2 border-red-100 rounded-2xl bg-white shadow-sm p-4 flex-grow overflow-y-auto">
           <div className="flex justify-between items-center mb-2">
             <h3 className="text-lg font-semibold text-[#D72638]">{selectedFolder.name}</h3>
             {selectedFolder.words.length > 0 && (
                <button onClick={() => setShowFlashcards(true)} className="flex items-center gap-1 text-sm px-3 py-1 bg-[#D72638] text-white rounded-full hover:bg-[#b8202f] shadow-sm">
                    <PlayIcon /> {t('vocabulary.flashcards')}
                </button>
             )}
           </div>
          <div className="space-y-2">
            {selectedFolder.words.length > 0 ? selectedFolder.words.map(word => (
              <div key={word.id} className="p-3 bg-gray-50 rounded-md flex justify-between items-center">
                <div className="flex-grow">
                  <p className="font-bold">{word.word}</p>
                  <p className="text-sm text-gray-600">{word.slangMeaning}</p>
                </div>
                <div className="flex items-center flex-shrink-0">
                    <button onClick={() => handleMoveClick(word)} className="p-1 text-gray-400 hover:text-blue-500"><MoveIcon /></button>
                    <button onClick={() => handleDeleteWord(word.id)} className="p-1 text-gray-400 hover:text-red-500"><TrashIcon /></button>
                </div>
              </div>
            )) : <p className="text-gray-500 text-center py-4">{t('vocabulary.emptyFolder')}</p>}
          </div>
        </div>
      )}

      {showFlashcards && selectedFolder && selectedFolder.words.length > 0 && (
        <FlashcardModal
          words={selectedFolder.words}
          onClose={() => setShowFlashcards(false)}
        />
      )}
      
      {wordToMove && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-lg shadow-xl w-11/12 max-w-sm">
                <h3 className="font-bold text-lg mb-2">{t('vocabulary.moveTitle', { word: wordToMove.word })}</h3>
                <p className="text-sm text-gray-600 mb-4">{t('vocabulary.movePrompt')}</p>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                {folders && folders
                    .filter(folder => folder.id !== selectedFolderId)
                    .map(folder => (
                    <button
                        key={folder.id}
                        onClick={() => handleMoveWord(folder.id)}
                        className="w-full text-left p-3 bg-gray-100 hover:bg-red-100 rounded-md transition"
                    >
                        {folder.name}
                    </button>
                ))}
                </div>
                <button
                onClick={() => setWordToMove(null)}
                className="mt-4 w-full p-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                >
                {t('cancel')}
                </button>
            </div>
        </div>
      )}
    </div>
  );
};

export default VocabularyView;
