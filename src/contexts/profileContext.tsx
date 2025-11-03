'use client';
import { createContext, useContext, useState } from 'react';

type ProfileContextType = {
  profileImage: string | null;
  updateProfileImage: (newImage: string) => void;
};

const ProfileContext = createContext<ProfileContextType>({
  profileImage: null,
  updateProfileImage: () => {},
});

export const ProfileProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const updateProfileImage = (newImage: string) => {
    setProfileImage(newImage);
  };

  return (
    <ProfileContext.Provider value={{ profileImage, updateProfileImage }}>
      {children}
    </ProfileContext.Provider>
  );
};

export const useProfile = () => useContext(ProfileContext);
