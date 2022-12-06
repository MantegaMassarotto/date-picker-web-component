import React, { useEffect, useRef } from 'react';

import useDatePicker from '../useDatePicker';

type Props = {
  onChange: (date: string) => void;
}

const DatePicker: React.FC<Props> = ({ onChange }) => {
  const elemRefYear = useRef<HTMLDivElement>(null);
  const elemRefMonth = useRef<HTMLDivElement>(null);
  const elemRefDay = useRef<HTMLDivElement>(null);

  const { date } = useDatePicker(elemRefYear, elemRefMonth, elemRefDay);

  useEffect(() => {
    if (date) {
      onChange(date);
    }
  }, [date, onChange]);

  return (
    <div className="date-selector">
      <div className="year" id="year" ref={elemRefYear} />
      <div className="month" id="month" ref={elemRefMonth} />
      <div className="day" id="day" ref={elemRefDay} />
    </div>
  );
};

export default DatePicker;
