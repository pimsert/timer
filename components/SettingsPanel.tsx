
import React, { useState, useEffect, useMemo } from 'react';
import type { ExamSettings, Language } from '../types';
import { translations } from '../constants';

interface SettingsPanelProps {
  settings: ExamSettings;
  onSettingsChange: (newSettings: ExamSettings) => void;
  onShowFullScreen: () => void;
  language: Language;
  onLanguageChange: (lang: Language) => void;
}

const SettingsInput: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
    {children}
  </div>
);

const SettingsPanel: React.FC<SettingsPanelProps> = ({ settings, onSettingsChange, onShowFullScreen, language, onLanguageChange }) => {
  const [endTime, setEndTime] = useState('');
  const T = useMemo(() => translations[language], [language]);

  useEffect(() => {
    const { startTime, durationHours, durationMinutes } = settings;
    if (startTime) {
      const [startHour, startMinute] = startTime.split(':').map(Number);
      const startDate = new Date();
      startDate.setHours(startHour, startMinute, 0, 0);

      const endDate = new Date(startDate.getTime() + (durationHours * 60 + durationMinutes) * 60000);
      setEndTime(endDate.toTimeString().slice(0, 5));
    } else {
      setEndTime('');
    }
  }, [settings.startTime, settings.durationHours, settings.durationMinutes]);

  const handleChange = (field: keyof ExamSettings, value: any) => {
    onSettingsChange({ ...settings, [field]: value });
  };

  const handleAlertChange = (alert: keyof ExamSettings['alerts'], value: number) => {
    onSettingsChange({ ...settings, alerts: { ...settings.alerts, [alert]: value } });
  };
  
  return (
    <div className="container mx-auto p-4 md:p-8">
      <header className="text-center mb-8">
        <div className="flex justify-end mb-4">
          <div className="flex bg-gray-200 rounded-lg p-1">
            <button onClick={() => onLanguageChange('th')} className={`px-4 py-2 rounded-md font-medium transition-colors ${language === 'th' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-300'}`}>
              ไทย
            </button>
            <button onClick={() => onLanguageChange('en')} className={`px-4 py-2 rounded-md font-medium transition-colors ${language === 'en' ? 'bg-blue-600 text-white' : 'text-gray-600 hover:bg-gray-300'}`}>
              English
            </button>
          </div>
        </div>
        <h1 className="text-4xl font-bold text-gray-800 mb-4">{T.title as string}</h1>
      </header>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4 text-gray-700">{T.examSettings as string}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <SettingsInput label={T.courseCode as string}>
            <input type="text" value={settings.courseCode} onChange={(e) => handleChange('courseCode', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={T.courseCodePlaceholder as string} />
          </SettingsInput>
          <SettingsInput label={T.courseName as string}>
            <input type="text" value={settings.courseName} onChange={(e) => handleChange('courseName', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={T.courseNamePlaceholder as string} />
          </SettingsInput>
          <SettingsInput label={T.section as string}>
            <input type="text" value={settings.courseSection} onChange={(e) => handleChange('courseSection', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={T.sectionPlaceholder as string} />
          </SettingsInput>
          <SettingsInput label={T.examRoom as string}>
            <input type="text" value={settings.examRoom} onChange={(e) => handleChange('examRoom', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={T.examRoomPlaceholder as string} />
          </SettingsInput>
          <SettingsInput label={T.startTime as string}>
            <input type="time" value={settings.startTime} onChange={(e) => handleChange('startTime', e.target.value)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </SettingsInput>
          <SettingsInput label={T.durationHours as string}>
            <input type="number" min="0" max="8" value={settings.durationHours} onChange={(e) => handleChange('durationHours', parseInt(e.target.value, 10) || 0)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </SettingsInput>
          <SettingsInput label={T.durationMinutes as string}>
            <input type="number" min="0" max="59" value={settings.durationMinutes} onChange={(e) => handleChange('durationMinutes', parseInt(e.target.value, 10) || 0)} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
          </SettingsInput>
          <SettingsInput label={T.endTime as string}>
            <input type="time" value={endTime} className="w-full p-3 border border-gray-300 rounded-lg bg-gray-100" readOnly />
          </SettingsInput>
        </div>
        <div className="mt-6">
          <SettingsInput label={T.additionalInfo as string}>
            <textarea value={settings.additionalInfo} onChange={(e) => handleChange('additionalInfo', e.target.value)} rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={T.additionalInfoPlaceholder as string}></textarea>
          </SettingsInput>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">{T.alertSettings as string}</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-green-700 mb-2">{T.alert1 as string}</label>
              <input type="number" value={settings.alerts.green} onChange={(e) => handleAlertChange('green', parseInt(e.target.value, 10) || 0)} min="1" max="180" className="w-full p-3 border border-green-300 rounded-lg focus:ring-2 focus:ring-green-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-yellow-700 mb-2">{T.alert2 as string}</label>
              <input type="number" value={settings.alerts.yellow} onChange={(e) => handleAlertChange('yellow', parseInt(e.target.value, 10) || 0)} min="1" max="60" className="w-full p-3 border border-yellow-300 rounded-lg focus:ring-2 focus:ring-yellow-500" />
            </div>
            <div>
              <label className="block text-sm font-medium text-red-700 mb-2">{T.alert3 as string}</label>
              <input type="number" value={settings.alerts.red} onChange={(e) => handleAlertChange('red', parseInt(e.target.value, 10) || 0)} min="1" max="30" className="w-full p-3 border border-red-300 rounded-lg focus:ring-2 focus:ring-red-500" />
            </div>
          </div>
        </div>
        <div className="mt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-700">{T.clockDisplayType as string}</h3>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input type="radio" name="clockType" value="digital" checked={settings.clockType === 'digital'} onChange={() => handleChange('clockType', 'digital')} className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
              <span>{T.digitalClock as string}</span>
            </label>
            <label className="flex items-center">
              <input type="radio" name="clockType" value="analog" checked={settings.clockType === 'analog'} onChange={() => handleChange('clockType', 'analog')} className="mr-2 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300" />
              <span>{T.analogClock as string}</span>
            </label>
          </div>
        </div>
        <div className="mt-8">
          <button onClick={onShowFullScreen} className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-6 rounded-lg transition-colors shadow-md hover:shadow-lg">
            {T.showFullScreen as string}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPanel;
