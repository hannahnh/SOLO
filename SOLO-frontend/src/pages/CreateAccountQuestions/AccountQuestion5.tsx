import React, { useState, useEffect } from 'react';
import { IonContent, IonPage } from '@ionic/react';
import { useAccount } from '../../contexts/AccountContext';
import CreateAccountHeader from '../../components/GradientHeader/CreateAccountHeader';
import '../../components/AccountQuestion.css';
import { useHistory, useLocation } from 'react-router-dom';

interface AccountQuestion5Props {
  onNextClick: (profilePhoto: File | null) => void;
  onBackClick: () => void;
}

interface NestedState {
  state: {
    name: string;
    email: string;
    phoneNumber: string;
    password: string;
  };
}

const AccountQuestion5: React.FC<AccountQuestion5Props> = ({ onNextClick, onBackClick }) => {
  const history = useHistory();
  const location = useLocation<NestedState>();

  const { profilePhoto, setProfilePhoto } = useAccount();
  const [localProfilePhoto, setLocalProfilePhoto] = useState<File | null>(profilePhoto || new File([''], 'default.png'));
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string>('');
  const [isValidImage, setIsValidImage] = useState(false);
  const [validationMessage, setValidationMessage] = useState<string>('');


  useEffect(() => {
    if (localProfilePhoto) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(localProfilePhoto);
    } else {
      setImagePreviewUrl(''); // Ensure the image preview is cleared if no photo is present
    }
  }, [localProfilePhoto]);

  const state = location.state?.state;
  if (!state) {
    //console.error('State is undefined');
    //istory.push('/home'); // Redirect to a safe page if state is missing
    return null;
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = event.target.files;
    if (fileList && fileList.length > 0) {
      const file = fileList[0];
      console.log('File selected:', file.name);

      if (file.type.startsWith('image/')) {
        console.log('Valid image file selected:', file.type);
        setLocalProfilePhoto(file);
        setIsValidImage(true);
        setValidationMessage('');

        // Update context state after validation
        setProfilePhoto(file);
        console.log('Profile photo set:', file);

        const reader = new FileReader();
        reader.onloadend = () => {
          console.log('FileReader load end, result length:', reader.result ? reader.result.toString().length : 'No result');
          setImagePreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      } else {
        console.error('Invalid file type:', file.type); // Log that an invalid file type was selected
        setIsValidImage(false);
        setValidationMessage('Invalid file type. Please select a valid image file.');
      }
    } else {
      console.log('No file selected');
    }
  };

  const handleNextClick = async () => {
    console.log('isValidImage:', isValidImage);
    console.log('profilePhoto:', profilePhoto);

    if (isValidImage && profilePhoto) {
      console.log('Profile photo before setting account:', profilePhoto);

      const formData = new FormData();
      formData.append('file', profilePhoto);

      try {
        console.log('Frontend POST: attempting post');
        const response = await fetch('http://localhost:3000/upload', {
          method: 'POST',
          body: formData,
        });

        if (response.ok) {
          console.log('Frontend POST: Image uploaded successfully');
        } else {
          console.error('Frontend POST: Image upload failed');
        }
      } catch (error) {
        console.error('Frontend POST catch: Error uploading image:', error);
      }

      onNextClick(profilePhoto); // Use the passed prop to handle the next click
      history.push('/account-question-6', { state: { name, email, phoneNumber, password, profilePhoto } });
    } else {
      alert('Please ensure your image is the correct type.');
    }
  };

  // if (!state) {
  //   return null; // Prevent rendering if state is undefined
  // }

  const { name, email, phoneNumber, password } = state;

  return (
    <IonPage>
      <CreateAccountHeader />
      <IonContent>
        <div className="question-view">
          <div className="step-info">Step 5 of 6</div>
          <div className="question">Upload profile photo</div>
          <label htmlFor="file-upload" className="custom-file-upload">
            {imagePreviewUrl ? (
              <img src={imagePreviewUrl} alt="Profile Preview" className="image-preview" />
            ) : (
              <div className="upload-content">
                <div className="upload-icon">+</div>
                <div className="upload-text">Upload</div>
              </div>
            )}
          </label>
          <input
            id="file-upload"
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />
          {validationMessage && <div className="error-message">{validationMessage}</div>}
        </div>
      </IonContent>
      <div className="navigation-buttons">
        <button onClick={onBackClick} className="back-button">BACK</button>
        <button
          onClick={handleNextClick}
          className="next-button"
          disabled={!isValidImage}
        >
          NEXT
        </button>
      </div>
    </IonPage>
  );
};

export default AccountQuestion5;
