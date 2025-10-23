
export type Language = 'th' | 'en';

export interface ExamSettings {
  courseCode: string;
  courseName: string;
  courseSection: string;
  examRoom: string;
  startTime: string;
  durationHours: number;
  durationMinutes: number;
  additionalInfo: string;
  alerts: {
    green: number;
    yellow: number;
    red: number;
  };
  clockType: 'digital' | 'analog';
  backgroundColor: string;
  disableAlertColors: boolean;
}

export type ExamStatus = 'idle' | 'waiting' | 'running' | 'finished';

export type AlertState = 'none' | 'green' | 'yellow' | 'red';

export interface TimeRemaining {
    hours: number;
    minutes: number;
    seconds: number;
    isNegative: boolean;
}