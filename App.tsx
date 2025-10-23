import React, { useState, useEffect, useCallback } from 'react';
import SettingsPanel from './components/SettingsPanel';
import FullScreenDisplay from './components/FullScreenDisplay';
import type { ExamSettings, Language, ExamStatus, TimeRemaining, AlertState } from './types';
import { translations, defaultThaiInfo, defaultEnglishInfo } from './constants';

const getDefaultStartTime = (): string => {
  const now = new Date();
  const nextHour = new Date(now);
  nextHour.setHours(now.getHours() + 1, 0, 0, 0);
  return nextHour.toTimeString().slice(0, 5);
};

const getInitialSettings = (lang: Language): ExamSettings => ({
  courseCode: '',
  courseName: '',
  courseSection: '',
  examRoom: '',
  startTime: getDefaultStartTime(),
  durationHours: 2,
  durationMinutes: 0,
  additionalInfo: lang === 'th' ? defaultThaiInfo : defaultEnglishInfo,
  alerts: {
    green: 60,
    yellow: 15,
    red: 5,
  },
  clockType: 'digital',
});


const App: React.FC = () => {
  const [language, setLanguage] = useState<Language>('th');
  const [settings, setSettings] = useState<ExamSettings>(getInitialSettings('th'));
  const [isFullScreen, setIsFullScreen] = useState(false);
  
  const [examStatus, setExamStatus] = useState<ExamStatus>('idle');
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>({ hours: 0, minutes: 0, seconds: 0, isNegative: false });
  const [alertState, setAlertState] = useState<AlertState>('none');
  const [examStartTime, setExamStartTime] = useState<Date | null>(null);
  const [examEndTime, setExamEndTime] = useState<Date | null>(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    setSettings(prevSettings => {
        const isDefault = prevSettings.additionalInfo.trim() === defaultThaiInfo.trim() || prevSettings.additionalInfo.trim() === defaultEnglishInfo.trim();
        if (isDefault || prevSettings.additionalInfo.trim() === '') {
            return {
                ...prevSettings,
                additionalInfo: language === 'th' ? defaultThaiInfo : defaultEnglishInfo
            };
        }
        return prevSettings;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [language]);

  useEffect(() => {
    let interval: number | undefined;

    if (isFullScreen && examStatus !== 'finished' && examStatus !== 'idle') {
      interval = window.setInterval(() => {
        const now = new Date();
        setCurrentTime(now);

        if (!examStartTime || !examEndTime) return;

        let diff: number;
        let currentStatus: ExamStatus = 'running';

        if (now < examStartTime) {
          diff = examStartTime.getTime() - now.getTime();
          currentStatus = 'waiting';
        } else if (now < examEndTime) {
          diff = examEndTime.getTime() - now.getTime();
          currentStatus = 'running';
        } else {
          diff = 0;
          currentStatus = 'finished';
        }
        
        setExamStatus(currentStatus);

        if(currentStatus === 'finished') {
            setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, isNegative: false });
            setAlertState('none');
            clearInterval(interval);
            return;
        }

        const totalSeconds = Math.ceil(diff / 1000);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const seconds = totalSeconds % 60;
        setTimeRemaining({ hours, minutes, seconds, isNegative: diff < 0 });

        if (currentStatus === 'running') {
            const remainingMinutes = Math.ceil(diff / (1000 * 60));
            if (remainingMinutes <= settings.alerts.red) {
                setAlertState('red');
            } else if (remainingMinutes <= settings.alerts.yellow) {
                setAlertState('yellow');
            } else if (remainingMinutes <= settings.alerts.green) {
                setAlertState('green');
            } else {
                setAlertState('none');
            }
        } else {
            setAlertState('none');
        }

      }, 1000);
    }
    return () => {
        if (interval) clearInterval(interval);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullScreen, examStatus, examStartTime, examEndTime, settings.alerts]);

  const handleShowFullScreen = () => {
    const T = translations[language];
    const { startTime, durationHours, durationMinutes } = settings;

    if (!startTime) {
      alert(T.validationStartTime as string);
      return;
    }

    const totalMinutes = durationHours * 60 + durationMinutes;
    if (totalMinutes <= 0) {
        alert(T.validationZeroDuration as string);
        return;
    }
    
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const startDate = new Date();
    startDate.setHours(startHour, startMinute, 0, 0);

    setExamStartTime(startDate);
    const endDate = new Date(startDate.getTime() + totalMinutes * 60000);
    setExamEndTime(endDate);
    setExamStatus('waiting');
    setIsFullScreen(true);
  };

  const resetExamState = useCallback(() => {
    setIsFullScreen(false);
    setExamStatus('idle');
    setAlertState('none');
    setExamStartTime(null);
    setExamEndTime(null);
    setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, isNegative: false });
  }, []);

  const handleHideFullScreen = () => {
    resetExamState();
  };
  
  const handleEndExam = () => {
    resetExamState();
    setSettings(getInitialSettings(language));
  };


  return (
    <>
      {!isFullScreen ? (
        <SettingsPanel
          settings={settings}
          onSettingsChange={setSettings}
          onShowFullScreen={handleShowFullScreen}
          language={language}
          onLanguageChange={setLanguage}
        />
      ) : (
        <FullScreenDisplay
          settings={settings}
          status={examStatus}
          alertState={alertState}
          timeRemaining={timeRemaining}
          currentTime={currentTime}
          language={language}
          onHideFullScreen={handleHideFullScreen}
          onEndExam={handleEndExam}
        />
      )}
    </>
  );
};

export default App;