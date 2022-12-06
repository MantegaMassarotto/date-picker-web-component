import React, { useRef } from 'react';

import useDatePicker from '../useDatePicker';

const DatePicker: React.FC = (props) => {
  const elemRefYear = useRef<HTMLDivElement>(null);
  const elemRefMonth = useRef<HTMLDivElement>(null);
  const elemRefDay = useRef<HTMLDivElement>(null);

  useDatePicker(elemRefYear, elemRefMonth, elemRefDay);

  return (
    <div className="date-selector">
      <div className='year' id='year' ref={elemRefYear} />
      <div className='month' id='month' ref={elemRefMonth} />
      <div className='day' id='day' ref={elemRefDay} />
    </div>
  );
};

export default DatePicker;
