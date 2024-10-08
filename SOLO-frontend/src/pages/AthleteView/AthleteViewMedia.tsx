import React, { useState, useEffect, useContext } from 'react';
import { IonPage, IonHeader, IonToolbar, IonButtons, IonBackButton, IonContent, IonList, IonItem, IonLabel, IonButton } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import DynamicHeader from '../../components/AthleteView/DynamicHeader'; 
import TabBar2 from './TabBar2';
import { AuthContext } from '../../contexts/AuthContext';
import { ApiService } from '../../../services/api.service';

interface MediaItem {
  media_id: string;
  id: string;
  name: string;
  signedUrl: string;
}

const AthleteViewMedia: React.FC = () => {
  const authContext = useContext(AuthContext);
  const { userId } = authContext!;
  const [currentMedia, setCurrentMedia] = useState<MediaItem[]>([]);
  const [pastMedia, setPastMedia] = useState<MediaItem[]>([]);
  const [refresh, setRefresh] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (userId) {
      fetchCurrentMedia();
      fetchPastMedia();
    }
  }, [userId, refresh, location]);

  const fetchCurrentMedia = async () => {
    if (!userId) {
      console.error('User ID is not available');
      return;
    }

    try {
      const response = await ApiService.getMediaByAthleteId({ athleteId: userId, type: 'current' });
      console.log('Media fetched:', response);
      setCurrentMedia(response.slice(0, 2)); // Slice to get only the two most recent
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const fetchPastMedia = async () => {
    if (!userId) {
      console.error('User ID is not available');
      return;
    }

    try {
      const response = await ApiService.getMediaByAthleteId({ athleteId: userId, type: 'past' });
      console.log('Media fetched:', response);
      setPastMedia(response.slice(0, 2)); // Slice to get only the two most recent
    } catch (error) {
      console.error('Error fetching media:', error);
    }
  };

  const handleDelete = async (media_id: string, type: 'current' | 'past') => {
    try {
      const response = await fetch(`http://localhost:3000/media/media/${media_id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        if (type === 'current') {
          setCurrentMedia(currentMedia.filter(media => media.media_id !== media_id));
        } else {
          setPastMedia(pastMedia.filter(media => media.media_id !== media_id));
        }
        setRefresh(!refresh); // Trigger refresh
      } else {
        console.error('Failed to delete media');
      }
    } catch (error) {
      console.error('Error deleting media:', error);
    }
  };

  const handleMoveToPast = async (id: string) => {
    try {
      await ApiService.moveToPast(id);
      setCurrentMedia(currentMedia.filter(media => media.id !== id));
      setRefresh(!refresh); // Trigger refresh
    } catch (error) {
      console.error('Error moving media to past:', error);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/athlete-view-account" />
          </IonButtons>
          <header style={{ backgroundColor: 'white', marginLeft: '18%'}}>
            <div className="logo">MY MEDIA</div>
          </header>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div className="media-section">
          <h2 className="section-title">Current Media</h2>
          <IonList>
            {currentMedia.map((media) => (
              <IonItem className="media-item" key={media.id}>
                <img src={media.signedUrl} alt={media.name} className="media-image" />
                <IonLabel style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '10px' }}>{media.name}</IonLabel>
                <button style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginLeft: '5px' }} onClick={() => handleDelete(media.media_id, 'current')}>🗑️</button>
                <button style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginLeft: '5px' }} onClick={() => handleMoveToPast(media.id)}>Move to Past Media</button>
              </IonItem>
            ))}
          </IonList>
          <div className="view-more-container">
            <IonButton routerLink="/athlete-current-media" fill="clear" color="primary">View More</IonButton>
          </div>
        </div>

        <div className="media-section">
          <h2 className="section-title">Past Media</h2>
          <IonList>
            {pastMedia.map((media) => (  
              <IonItem className="media-item" key={media.id}>
                <img src={media.signedUrl} alt={media.name} className="media-image" />
                <IonLabel style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginRight: '10px' }}>{media.name}</IonLabel>
                <button style={{ background: 'none', border: 'none', color: '#007bff', cursor: 'pointer', marginLeft: '5px' }} onClick={() => handleDelete(media.media_id, 'past')}>🗑️</button>
              </IonItem>
            ))}
          </IonList>
          <div className="view-more-container">
            <IonButton routerLink="/athlete-past-media" fill="clear" color="primary">View More</IonButton>
          </div>
        </div>
      </IonContent>
      <TabBar2 />
    </IonPage>
  );
};

export default AthleteViewMedia;
