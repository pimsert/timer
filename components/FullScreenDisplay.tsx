import React, { useState, useMemo } from 'react';
import type { ExamSettings, ExamStatus, AlertState, TimeRemaining, Language } from '../types';
import { translations, colorPalettes } from '../constants';
import AnalogClock from './AnalogClock';

interface FullScreenDisplayProps {
  settings: ExamSettings;
  setSettings: (settings: ExamSettings) => void;
  status: ExamStatus;
  alertState: AlertState;
  timeRemaining: TimeRemaining;
  currentTime: Date;
  language: Language;
  onHideFullScreen: () => void;
  onEndExam: () => void;
}

const formatTime = (time: TimeRemaining) => {
    return `${String(time.hours).padStart(2, '0')}:${String(time.minutes).padStart(2, '0')}:${String(time.seconds).padStart(2, '0')}`;
};

const formatCurrentTime = (date: Date) => {
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    return `${hours}:${minutes}:${seconds}`;
};

const FullScreenDisplay: React.FC<FullScreenDisplayProps> = ({
  settings,
  setSettings,
  status,
  alertState,
  timeRemaining,
  currentTime,
  language,
  onHideFullScreen,
  onEndExam,
}) => {
  const [clockMode, setClockMode] = useState(settings.clockType);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const T = useMemo(() => translations[language], [language]);

  const backgroundClass = useMemo(() => {
    if (settings.disableAlertColors) {
      return settings.backgroundColor;
    }
    switch (alertState) {
      case 'red': return 'bg-gradient-to-br from-red-600 to-red-800';
      case 'yellow': return 'bg-gradient-to-br from-yellow-600 to-yellow-800';
      case 'green': return 'bg-gradient-to-br from-teal-600 to-teal-800';
      default: return settings.backgroundColor;
    }
  }, [alertState, settings.backgroundColor, settings.disableAlertColors]);
  
  const handleChange = (field: keyof ExamSettings, value: any) => {
    setSettings({ ...settings, [field]: value });
  };

  const alertMessage = useMemo(() => {
    switch (alertState) {
      case 'green': return T.alertGreen as string;
      case 'yellow': return (T.alertYellow as Function)(settings.alerts.yellow);
      case 'red': return (T.alertRed as Function)(settings.alerts.red);
      default: return null;
    }
  }, [alertState, T, settings.alerts]);

  const toggleClockMode = () => {
    setClockMode(prev => prev === 'digital' ? 'analog' : 'digital');
  };

  const examPeriod = `${settings.startTime} - ${new Date(new Date(`1970-01-01T${settings.startTime}:00`).getTime() + (settings.durationHours * 60 + settings.durationMinutes) * 60000).toTimeString().slice(0, 5)}`;
  
  if (status === 'finished') {
    return (
      <div className="fixed inset-0 bg-red-900 flex flex-col justify-center items-center text-center p-4">
        <div className="font-bold text-red-200 p-8 rounded-lg drop-shadow-lg animate-pulse text-4xl sm:text-5xl md:text-7xl mb-12" dangerouslySetInnerHTML={{ __html: T.timesUpTitle as string }} />
        <button onClick={onEndExam} className="bg-red-600 hover:bg-red-700 text-white font-bold py-4 px-8 rounded-lg text-2xl transition-colors shadow-lg">
          {T.endExamTimer as string}
        </button>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-50 text-white transition-colors duration-500 ${backgroundClass}`}>
      <div className="absolute top-4 left-4 z-50 flex gap-4">
        <button onClick={onHideFullScreen} className="bg-black bg-opacity-70 hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg">
          {T.backToSettings as string}
        </button>
        <button onClick={toggleClockMode} className="bg-blue-600 bg-opacity-80 hover:bg-blue-700 hover:bg-opacity-90 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg">
          {clockMode === 'digital' ? T.switchToAnalog as string : T.switchToDigital as string}
        </button>
      </div>
      
      <div className="absolute top-4 left-1/2 -translate-x-1/2 z-50">
        <button onClick={() => setIsSettingsOpen(true)} className="bg-black bg-opacity-50 hover:bg-opacity-70 text-white font-bold py-3 px-6 rounded-lg transition-all shadow-lg">
          {T.displaySettingsButton as string}
        </button>
      </div>
      
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-[100]" onClick={() => setIsSettingsOpen(false)}>
            <div className="bg-white text-gray-800 rounded-lg shadow-2xl p-6 w-full max-w-sm relative" onClick={(e) => e.stopPropagation()}>
                <button onClick={() => setIsSettingsOpen(false)} className="absolute top-3 right-3 text-gray-400 hover:text-gray-800 text-3xl leading-none font-semibold">&times;</button>
                <h3 className="text-xl font-semibold mb-6">{T.displaySettings as string}</h3>
                <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 mb-3">{T.backgroundColor as string}</label>
                    <div className="flex flex-wrap gap-4">
                        {colorPalettes.map((palette) => (
                            <button
                                key={palette.class}
                                onClick={() => handleChange('backgroundColor', palette.class)}
                                className={`w-10 h-10 rounded-full cursor-pointer transition-transform transform hover:scale-110 ${palette.class} ${settings.backgroundColor === palette.class ? 'ring-4 ring-offset-2 ring-blue-500' : 'ring-2 ring-gray-300'}`}
                                title={palette.name}
                                aria-label={palette.name}
                            />
                        ))}
                    </div>
                </div>
                <div>
                    <label className="flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            checked={settings.disableAlertColors}
                            onChange={(e) => handleChange('disableAlertColors', e.target.checked)}
                            className="mr-3 h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <span className="text-gray-700">{T.disableAlertColors as string}</span>
                    </label>
                </div>
            </div>
        </div>
      )}

      {alertMessage && status === 'running' && (
        <div className="absolute top-4 right-4 z-50">
          <div className="text-center text-2xl font-semibold p-4 rounded-lg bg-white bg-opacity-20 backdrop-blur-sm drop-shadow-lg animate-pulse max-w-xl">
            {alertMessage}
          </div>
        </div>
      )}
      
      <div className="h-full flex flex-col justify-center items-center p-4">
        {/* Digital Clock View */}
        {clockMode === 'digital' && (
          <div className="w-full text-center flex flex-col justify-center items-center flex-grow">
            <div className="mb-8 md:mb-16">
              {/* FIX: Cast translation values to string to satisfy ReactNode type, as they are known to be strings. */}
              <p className="text-4xl md:text-5xl text-white mb-4 drop-shadow-lg">{(status === 'waiting' ? T.timeBeforeExam : T.timeRemaining) as string}</p>
              <div className="font-bold text-white drop-shadow-lg digital-font text-7xl sm:text-8xl md:text-9xl lg:text-[12rem] mt-12">{formatTime(timeRemaining)}</div>
            </div>
             <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 px-8 md:px-16">
                <div className="text-left">
                    {settings.additionalInfo && (
                        <div className={`text-yellow-200 drop-shadow-lg p-4 bg-black bg-opacity-30 rounded-lg text-3xl`} dangerouslySetInnerHTML={{ __html: settings.additionalInfo.replace(/\n/g, '<br />') }} />
                    )}
                </div>
                <div className="text-left space-y-4 md:space-y-6 text-3xl md:text-4xl">
                    {settings.courseCode && (
                        <div className="text-white drop-shadow-lg">
                            <span>{T.courseCode as string}</span> <span className="font-semibold">{settings.courseCode}</span>
                        </div>
                    )}
                    {settings.courseName && (
                        <div className="text-white drop-shadow-lg">
                           <span>{T.courseName as string}</span> <span className="font-semibold">{settings.courseName}</span>
                        </div>
                    )}
                    {(settings.courseSection || settings.examRoom) && (
                        <div className="text-white drop-shadow-lg">
                            {settings.courseSection && <><span>{T.section as string}</span> <span className="font-semibold">{settings.courseSection}</span></>}
                            {settings.examRoom && <><span className={settings.courseSection ? "ml-4" : ""}>{T.examRoom as string}</span> <span className="font-semibold">{settings.examRoom}</span></>}
                        </div>
                    )}
                    <div className="text-white drop-shadow-lg font-semibold text-4xl md:text-5xl">
                        <span>{T.examTime as string}</span> <span>{examPeriod}</span> <span className="ml-2">{T.unit as string}</span>
                    </div>
                </div>
            </div>
          </div>
        )}

        {/* Analog Clock View */}
        {clockMode === 'analog' && (
          <div className="w-full h-full flex items-center justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start w-full px-8 md:px-16 mx-auto">
              <div className="text-center lg:text-left">
                <div className="mb-8">
                    <p className="text-3xl md:text-4xl text-white mb-2 drop-shadow-lg">{(status === 'waiting' ? T.timeBeforeExam : T.timeRemaining) as string}</p>
                    <div className="font-bold text-white drop-shadow-lg digital-font text-6xl md:text-8xl mt-4">{formatTime(timeRemaining)}</div>
                </div>
                <div className="space-y-4 md:space-y-6 text-2xl md:text-3xl lg:text-4xl">
                    {settings.courseCode && (
                        <div className="text-white drop-shadow-lg">
                            <span>{T.courseCode as string}</span> <span className="font-semibold">{settings.courseCode}</span>
                        </div>
                    )}
                    {settings.courseName && (
                        <div className="text-white drop-shadow-lg">
                           <span>{T.courseName as string}</span> <span className="font-semibold">{settings.courseName}</span>
                        </div>
                    )}
                    {(settings.courseSection || settings.examRoom) && (
                        <div className="text-white drop-shadow-lg">
                            {settings.courseSection && <><span>{T.section as string}</span> <span className="font-semibold">{settings.courseSection}</span></>}
                            {settings.examRoom && <><span className={settings.courseSection ? "ml-4" : ""}>{T.examRoom as string}</span> <span className="font-semibold">{settings.examRoom}</span></>}
                        </div>
                    )}
                    <div className="text-white drop-shadow-lg font-semibold text-4xl md:text-5xl">
                        <span>{T.examTime as string}</span> <span>{examPeriod}</span> <span className="ml-2">{T.unit as string}</span>
                    </div>
                </div>
                <div className="w-full mt-8">
                    {settings.additionalInfo && (
                        <div className={`text-yellow-200 drop-shadow-lg p-4 bg-black bg-opacity-30 rounded-lg text-2xl`} dangerouslySetInnerHTML={{ __html: settings.additionalInfo.replace(/\n/g, '<br />') }} />
                    )}
                </div>
              </div>
              <div className="flex flex-col justify-start items-center scale-75 md:scale-90 lg:scale-100 space-y-8">
                <AnalogClock time={currentTime} size={400}/>
                <div className="mt-8 text-center">
                  <p className="text-3xl text-white mb-2 drop-shadow-lg">{T.currentTime as string}</p>
                  <div className="text-5xl font-bold text-white drop-shadow-lg digital-font">{formatCurrentTime(currentTime)}</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FullScreenDisplay;