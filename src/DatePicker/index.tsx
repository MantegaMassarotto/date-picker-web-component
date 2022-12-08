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
    <div className='date-selector-container'>
      <div style={{ display: 'flex', flex: 0.1, flexDirection: 'row', justifyContent: 'space-between', paddingLeft: 10, paddingRight: 10, backgroundColor: 'white', marginTop: 10, marginLeft: 4, marginRight: 5 }}>
        <button style={{ backgroundColor: 'white', border: 0, color: '#0074E0', fontSize: 16 }}>Cancel</button>
        <h1 style={{ color: '#001489', fontSize: 20 }}>Date Of Birth</h1>
        <button style={{ backgroundColor: 'white', border: 0, color: '#0074E0', fontWeight: 'bold', fontSize: 16  }}>Save</button>
      </div>
      <div className="date-selector">
        <div className="month" id="month" ref={elemRefMonth} />
        <div className="day" id="day" ref={elemRefDay} />
        <div className="year" id="year" ref={elemRefYear} />
      </div>
    </div>
  );
};

export default DatePicker;
