import React from 'react';
import { X, Edit, Notebook as Robot } from 'lucide-react';
import { MachineType } from '../../../types';
import { MACHINE_AVATARS, DEFAULT_AVATARS } from '../utils/avatarUtils';

interface AvatarSelectorProps {
  machineType: MachineType;
  avatarUrl: string;
  setAvatarUrl: (url: string) => void;
  showAvatarSelector: boolean;
  setShowAvatarSelector: (show: boolean) => void;
  isEditing: boolean;
}

const AvatarSelector: React.FC<AvatarSelectorProps> = ({
  machineType,
  avatarUrl,
  setAvatarUrl,
  showAvatarSelector,
  setShowAvatarSelector,
  isEditing
}) => {
  const handleAvatarClick = () => {
    if (isEditing) {
      setShowAvatarSelector(true);
    }
  };

  const selectAvatar = (url: string) => {
    setAvatarUrl(url);
    setShowAvatarSelector(false);
  };

  const avatarOptions = MACHINE_AVATARS[machineType] || DEFAULT_AVATARS;

  return (
    <div className="md:w-1/3 lg:w-1/4 relative bg-gradient-to-br from-blue-900 to-blue-700 h-64 md:h-auto"
      style={{
        backgroundImage: avatarUrl.startsWith('http') ? `url(${avatarUrl})` : undefined,
        backgroundSize: 'cover',
        backgroundPosition: 'center'
      }}
    >
      <div className="absolute inset-0 flex items-center justify-center">
        {!avatarUrl.startsWith('http') && (
          <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white">
            <Robot size={64} />
          </div>
        )}
      </div>
      
      {/* Avatar selector button */}
      {isEditing && (
        <button
          onClick={handleAvatarClick}
          className="absolute bottom-4 right-4 p-2 bg-white rounded-full shadow-md hover:bg-gray-100 transition-colors"
        >
          <Edit size={16} />
        </button>
      )}
      
      {showAvatarSelector && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex flex-col justify-center items-center z-10">
          <div className="bg-white p-4 rounded-lg shadow-lg w-5/6 max-h-[80%] overflow-y-auto">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-900">Select Avatar</h3>
              <button
                onClick={() => setShowAvatarSelector(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X size={18} />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-2">
              {avatarOptions.map((url, index) => (
                <button
                  key={index}
                  onClick={() => selectAvatar(url)}
                  className={`w-full h-24 overflow-hidden rounded-lg border-2 ${
                    url === avatarUrl ? 'border-blue-500' : 'border-transparent'
                  } hover:border-blue-300 transition-colors`}
                >
                  {url.startsWith('http') ? (
                    <img
                      src={url}
                      alt={`Avatar option ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-100 flex items-center justify-center">
                      <Robot size={36} className="text-blue-600" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AvatarSelector;