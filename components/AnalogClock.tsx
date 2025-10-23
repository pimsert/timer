import React from 'react';

interface AnalogClockProps {
  time: Date;
  size?: number;
}

const AnalogClock: React.FC<AnalogClockProps> = ({ time, size = 400 }) => {
  const hours = time.getHours();
  const minutes = time.getMinutes();
  const seconds = time.getSeconds();

  const hourAngle = (hours % 12) * 30 + minutes * 0.5;
  const minuteAngle = minutes * 6 + seconds * 0.1;
  const secondAngle = seconds * 6;

  const handBaseStyle = "absolute left-1/2 bottom-1/2 origin-bottom";
  const numberBaseStyle = "absolute font-bold text-red-600";
  
  // The transition is disabled when seconds are 0. This is the moment the wrap-around
  // animation would occur for all hands that cross the 12 o'clock mark.
  // By setting transition to 'none', we force the hand to "jump" to the new position
  // instead of animating backwards. A smooth cubic-bezier is used for other times.
  const transitionStyle = seconds === 0 ? 'none' : 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)';


  return (
    <div
      className="relative rounded-full border-solid bg-white shadow-lg"
      style={{ width: size, height: size, borderWidth: size / 25 }}
    >
      {[12, 3, 6, 9].map((num, i) => (
        <div
          key={num}
          className={numberBaseStyle}
          style={{
            fontSize: size / 12,
            top: i === 0 ? size/20 : i === 2 ? 'auto' : '50%',
            bottom: i === 2 ? size/20 : 'auto',
            left: i === 3 ? size/20 : i === 1 ? 'auto' : '50%',
            right: i === 1 ? size/20 : 'auto',
            transform: i % 2 === 0 ? 'translateX(-50%)' : 'translateY(-50%)',
          }}
        >
          {num}
        </div>
      ))}

      <div
        className={`${handBaseStyle} bg-gray-800 rounded-t-full`}
        style={{
          width: size / 50,
          height: size / 4,
          transform: `translateX(-50%) rotate(${hourAngle}deg)`,
          transition: transitionStyle,
        }}
      ></div>
      <div
        className={`${handBaseStyle} bg-gray-700 rounded-t-full`}
        style={{
          width: size / 80,
          height: size / 2.8,
          transform: `translateX(-50%) rotate(${minuteAngle}deg)`,
          transition: transitionStyle,
        }}
      ></div>
      <div
        className={`${handBaseStyle} bg-red-600`}
        style={{
          width: size / 133,
          height: size / 2.5,
          transform: `translateX(-50%) rotate(${secondAngle}deg)`,
          transition: transitionStyle,
        }}
      ></div>
      <div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gray-800 rounded-full"
        style={{ width: size / 20, height: size / 20 }}
      ></div>
    </div>
  );
};

export default AnalogClock;