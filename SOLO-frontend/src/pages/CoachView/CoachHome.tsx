import React, { useState, useContext, useEffect } from 'react';
import { IonContent, IonHeader, IonPage, IonCard, IonCardTitle, IonCardSubtitle, IonToolbar, useIonViewWillEnter } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { ApiService } from '../../../services/api.service'; // Ensure this path is correct
import { AuthContext } from '../../contexts/AuthContext'; // Ensure this path is correct
import TabBar from './TabBar';
import '../../components/CoachView/CoachHome.css'; // Make sure this path is correct
import defaultImage from '../../../public/Flying Mario.jpeg'; // Adjust the path if necessary

interface Athlete {
  athlete_id: string;
  profile_pic_url: string;
  name: string;
  email: string;
  affiliation_name: string;
}

const CoachHome: React.FC = () => {
  const history = useHistory();
  const authContext = useContext(AuthContext);
  const { userId } = authContext!;
  const [athletes, setAthletes] = useState<Athlete[]>([]);

  const fetchAthletes = async () => {
    try {
      if (!userId) {
        console.log('userId is not available'); // Debug log
        return;
      }

      const coachId = parseInt(userId, 10); // Convert userId to integer
      console.log('Fetching athletes for coachId:', coachId); // Debug log
      const linkedAthletes = await ApiService.getLinkedAthletes(coachId);
      console.log('Linked athletes:', linkedAthletes); // Debug log

      // Map through the linked athletes and ensure the profile_pic_url is correctly set
      const athletesWithProfilePic = await Promise.all(linkedAthletes.map(async (athlete: any) => {
        if (athlete.profile_pic) {
          const response = await fetch(`http://localhost:3001/file-url?key=${athlete.profile_pic}`);
          const data = await response.json();
          return {
            ...athlete,
            profile_pic_url: data.url || defaultImage,
          };
        } else {
          return {
            ...athlete,
            profile_pic_url: defaultImage,
          };
        }
      }));

      setAthletes(athletesWithProfilePic);
    } catch (error) {
      console.error('Error fetching linked athletes:', error);
    }
  };

  useIonViewWillEnter(() => {
    fetchAthletes();
  });

  const navigateToAddAthleteView = () => {
    history.push('/add-athlete-view');
  };

  const navigateToAthleteProfile = (athleteId: string) => {
    console.log('Navigating to athlete profile:', athleteId); // Debug log
    history.push(`/current-athlete-view?athleteId=${athleteId}&coachId=${userId}`);
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <header className="gradient-header">
            <div className="logo">MY CURRENT ATHLETES</div>
          </header>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', padding: '20px' }}>
          {athletes.map((athlete, index) => (
            <IonCard key={index} style={{ position: 'relative' }} onClick={() => navigateToAthleteProfile(athlete.athlete_id)}>
              <img 
                src={athlete.profile_pic_url || defaultImage}  // Use the athlete's profile picture if available
                alt={athlete.name} 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <div style={{ 
                position: 'absolute', 
                bottom: 0, 
                left: 0, 
                width: '100%', 
                padding: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.6)', // Semi-transparent white background
                backdropFilter: 'blur(1px)', // Blurring effect
                WebkitBackdropFilter: 'blur(10px)', // Blurring effect for Safari
              }}>
                <IonCardTitle style={{ color: 'black' }}>{athlete.name}</IonCardTitle>
                <IonCardSubtitle style={{ color: 'grey' }}>{athlete.affiliation_name}</IonCardSubtitle>
              </div>
            </IonCard>
          ))}
        </div>
        <button
          onClick={navigateToAddAthleteView}
          style={{
            position: 'fixed',
            right: '0.75rem',
            bottom: '6.75rem', // Adjusted bottom margin to ensure visibility above the tab bar
            backgroundImage: 'linear-gradient(to right, #3499CD 0%, #3485CD 29%, #354DCD 59%, #26256C 100%)',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '10px 20px',
            fontSize: '16px',
            cursor: 'pointer',
            zIndex: 1000, // Ensure the button is above the tab bar
          }}
        >
          + Add Athlete
        </button>
      </IonContent>
      <TabBar />
    </IonPage>
  );
};

export default CoachHome;
