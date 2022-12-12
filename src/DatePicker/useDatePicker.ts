import React, { useState, useCallback, useEffect } from 'react';

interface Config {
  itemHeight: number;
  itemAngle: number;
  radius: number;
  quarterCount: number;
}

// let moving: boolean;
let moveT = 0;
let a = 0.8 * 10;

const easing = {
  easeOutCubic: function (pos: number) {
    return Math.pow(pos - 1, 3) + 1;
  },
  easeOutQuart: function (pos: number) {
    return -(Math.pow(pos - 1, 4) - 1);
  },
};

interface Elem {
  el: HTMLDivElement;
  circleList: HTMLUListElement | null;
  circleItems: NodeListOf<any> | null ;
  highlight: HTMLDivElement | null;
  highlightList: HTMLUListElement | null;
  highListItems: any;
  events: {
    touchstart: (e: any) => void;
    touchmove: (e: any) => void;
    touchend: (e: any) => void;
  };
  values: { value: number; text: string }[];
  scroll: number;
}

const useDatePicker = (
  elemRefYear: React.RefObject<HTMLDivElement>,
  elemRefMonth: React.RefObject<HTMLDivElement>,
  elemRefDay: React.RefObject<HTMLDivElement>
) => {
  const [config, setConfig] = useState<Config>({
    itemAngle: 0,
    itemHeight: 0,
    radius: 0,
    quarterCount: 0,
  });
  const [elems, setElems] = useState<Elem[]>([]);
  const [dateString, setDateString] = useState('');
  const [year, setYear] = useState(1950);
  const [month, setMonth] = useState(1);
  const [day, setDay] = useState(1);

  useEffect(() => {
    if (year && month && day) {
      const date = `${year}-${month}-${day}`;
      setDateString(date);
    }
  }, [year, month, day]);

  const getMonths = (year?: string) => {
    let months: { value: number; text: string }[] = [
      { value: 1, text: 'January' },
      { value: 2, text: 'February' },
      { value: 3, text: 'March' },
      { value: 4, text: 'April' },
      { value: 5, text: 'May' },
      { value: 6, text: 'June' },
      { value: 7, text: 'July' },
      { value: 8, text: 'August' },
      { value: 9, text: 'September' },
      { value: 10, text: 'October' },
      { value: 11, text: 'November' },
      { value: 12, text: 'December' },
    ];
    return months;
  };

  const getDays = (year: number, month: number) => {
    let dayCount = new Date(year, month, 0).getDate();
    let days = [];

    for (let i = 1; i <= dayCount; i++) {
      days.push({
        value: i,
        text: i.toString(),
      });
    }
    return days;
  };

  const getYears = () => {
    let currentYear = new Date().getFullYear();
    let years = [];

    for (let i = currentYear - 72; i <= currentYear; i++) {
      years.push({
        value: i,
        text: i.toString(),
      });
    }
    return years;
  };

  const stop = () => {
    // moving = false;
    cancelAnimationFrame(moveT);
  };

  const normalizeScroll = useCallback((scroll: any, elem: Elem) => {
    let normalizedScroll = scroll;

    while (normalizedScroll < 0) {
      normalizedScroll += elem.values.length;
    }
    normalizedScroll = normalizedScroll % elem.values.length;

    return normalizedScroll;
  }, []);

  const moveTo = useCallback(
    (scroll: any, elem: Elem) => {
      scroll = normalizeScroll(scroll, elem);

      if (scroll) {
        const selected = elem.values[scroll]
          ? elem.values[scroll]
          : elem.values[0];
        if (elem.el === elemRefYear.current) {
          setYear(selected.value);
        } else if (elem.el === elemRefMonth.current) {
          setMonth(selected.value);
        } else if (elem.el === elemRefDay.current) {
          setDay(selected.value);
        }
      }

      if (config && elem.highlightList && elem.circleList && elem.circleItems) {
        const { radius, itemAngle, itemHeight, quarterCount } = config;

        elem.circleList.style.transform = `translate3d(0, 0, ${-radius}px) rotateX(${
          itemAngle * scroll
        }deg)`;
        elem.highlightList.style.transform = `translate3d(0, ${
          -scroll * itemHeight
        }px, 0)`;

        elem.el.style.color = 'transparent';

        Array.from(elem.circleItems).forEach((itemElem) => {
          if (Math.abs(itemElem.dataset.index - scroll) > quarterCount) {
            itemElem.style.visibility = 'hidden';
          } else {
            itemElem.style.visibility = 'visible';
          }
        });
      }
      return scroll;
    },
    [normalizeScroll, config, elemRefYear, elemRefMonth, elemRefDay]
  );

  const animateToScroll = useCallback(
    (initScroll: any, finalScroll: any, t: any, elem: Elem) => {
      if (initScroll === finalScroll || t === 0) {
        moveTo(initScroll, elem);
        return;
      }

      let start = new Date().getTime() / 1000;
      let pass = 0;
      let totalScrollLen = finalScroll - initScroll;

      return new Promise<void>((resolve) => {
        // moving = true;
        let tick = () => {
          pass = new Date().getTime() / 1000 - start;

          if (pass < t) {
            elem.scroll = moveTo(
              initScroll + easing['easeOutQuart'](pass / t) * totalScrollLen,
              elem
            );
            moveT = requestAnimationFrame(tick);
          } else {
            resolve();
            stop();
            elem.scroll = moveTo(initScroll + totalScrollLen, elem);
          }
        };
        tick();
      });
    },
    [moveTo]
  );

  const touchstart = useCallback((e: any, touchData: any, elem: Elem) => {
    elem.el.addEventListener('touchmove', elem.events.touchmove);
    document.addEventListener('mousemove', elem.events.touchmove);
    let eventY = e.clientY || e.touches[0].clientY;
    touchData.startY = eventY;
    touchData.yArr = [[eventY, new Date().getTime()]];
    touchData.touchScroll = elem.scroll;
    stop();
  }, []);

  const selectByScroll = useCallback(
    (paramScroll: any, elem: Elem) => {
      paramScroll = normalizeScroll(paramScroll, elem) | 0;

      if (paramScroll > elem.values.length - 1) {
        paramScroll = elem.values.length - 1;
        moveTo(paramScroll, elem);
      }
      moveTo(paramScroll, elem);
      elem.scroll = paramScroll;
    },
    [moveTo, normalizeScroll]
  );

  const animateMoveByInitV = useCallback(
    (initV: any, elem: Elem) => {
      let finalScroll;

      let totalScrollLen;
      let a1 = 0;
      let t1 = 0;

      a1 = initV > 0 ? -a : a;
      t1 = Math.abs(initV / a1);
      totalScrollLen = initV * t1 + (a1 * t1 * t1) / 2;
      finalScroll = Math.round(elem.scroll + totalScrollLen);
      animateToScroll(elem.scroll, finalScroll, t1, elem);

      selectByScroll(elem.scroll, elem);
    },
    [animateToScroll, selectByScroll]
  );

  const touchend = useCallback(
    (e: any, touchData: any, elem: Elem) => {
      const { itemHeight } = config;

      elem.el.removeEventListener('touchmove', elem.events.touchmove);
      document.removeEventListener('mousemove', elem.events.touchmove);

      let v;

      if (touchData.yArr.length === 1) {
        v = 0;
      } else {
        let startTime = touchData.yArr[touchData.yArr.length - 2][1];
        let endTime = touchData.yArr[touchData.yArr.length - 1][1];
        let startY = touchData.yArr[touchData.yArr.length - 2][0];
        let endY = touchData.yArr[touchData.yArr.length - 1][0];

        v = (((startY - endY) / itemHeight) * 1000) / (endTime - startTime);
        let sign = v > 0 ? 1 : -1;

        v = Math.abs(v) > 30 ? 30 * sign : v;
      }

      elem.scroll = touchData.touchScroll;
      animateMoveByInitV(v, elem);
    },
    [animateMoveByInitV, config]
  );

  const touchmove = useCallback(
    (e: any, touchData: any, elem: Elem) => {
      const { itemHeight } = config;

      let eventY = e.clientY || e.touches[0].clientY;
      touchData.yArr.push([eventY, new Date().getTime()]);
      if (touchData.length > 5) {
        touchData.unshift();
      }

      let scrollAdd = (touchData.startY - eventY) / itemHeight;
      let moveToScroll = scrollAdd + elem.scroll;

      moveToScroll = normalizeScroll(moveToScroll, elem);

      touchData.touchScroll = moveTo(moveToScroll, elem);
    },
    [config, moveTo, normalizeScroll]
  );

  const mountTemplate = useCallback(
    (elem: Elem) => {
      const { radius, itemHeight, itemAngle, quarterCount } = config;

      let circleListHTML = '';

      for (let i = 0; i < elem.values.length; i++) {
        circleListHTML += `<li class="select-option"
                  style="
                    top: ${itemHeight * -0.5}px;
                    height: ${itemHeight}px;
                    line-height: ${itemHeight}px;
                    transform: rotateX(${
                      -itemAngle * i
                    }deg) translate3d(0, 0, ${radius}px);
                  "
                  data-index="${i}"
                  >${elem.values[i].text}</li>`;
      }

      let highListHTML = '';

      for (let i = 0; i < elem.values.length; i++) {
        highListHTML += `<li class="highlight-item" style="height: ${itemHeight}px;">
                      ${elem.values[i].text}
                    </li>`;
      }

      for (let i = 0; i < quarterCount; i++) {
        circleListHTML =
          `<li class="select-option"
                    style="
                      top: ${itemHeight * -0.5}px;
                      height: ${itemHeight}px;
                      line-height: ${itemHeight}px;
                      transform: rotateX(${
                        itemAngle * (i + 1)
                      }deg) translate3d(0, 0, ${radius}px);
                    "
                    data-index="${-i - 1}"
                    >${elem.values[elem.values.length - i - 1].text}</li>` +
          circleListHTML;

        circleListHTML += `<li class="select-option"
                    style="
                      top: ${itemHeight * -0.5}px;
                      height: ${itemHeight}px;
                      line-height: ${itemHeight}px;
                      transform: rotateX(${
                        -itemAngle * (i + elem.values.length)
                      }deg) translate3d(0, 0, ${radius}px);
                    "
                    data-index="${i + elem.values.length}"
                    >${elem.values[i].text}</li>`;
      }

      highListHTML =
        `<li class="highlight-item" style="height: ${itemHeight}px;">
      ${elem.values[elem.values.length - 1].text}
      </li>` + highListHTML;
      highListHTML += `<li class="highlight-item" style="height: ${itemHeight}px;">${elem.values[0].text}</li>`;

      const template = `
        <div id=${elem.el.id} class="select-wrap">
          <ul id=${
            elem.el.id
          } class="select-options" style="transform: translate3d(0, 0, ${-radius}px) rotateX(0deg);">
            ${circleListHTML}
            <!-- <li class="select-option">a0</li> -->
          </ul>
          <div class="highlight">
            <ul class="highlight-list">
              <!-- <li class="highlight-item"></li> -->
              ${highListHTML}
            </ul>
          </div>
        </div>
      `;

      elem.el.innerHTML = template;

      elem.circleList = elem.el.querySelector('.select-options');

      elem.circleItems = elem.el.querySelectorAll('.select-option');

      elem.highlight = elem.el.querySelector('.highlight');
      elem.highlightList = elem.el.querySelector('.highlight-list');

      if (elem.highlight &&  elem.highlightList &&  elem.circleList) {
        elem.highlightList.style.right = -20 + 'px';

        elem.highlight.style.height = itemHeight + 'px';
        elem.highlight.style.lineHeight = itemHeight + 'px';
  
        if (elem.el === elemRefMonth.current) {
          elem.highlight.style.textAlign = 'center';
          elem.circleList.style.textAlign = 'center';
        }
      }

      let touchData = {
        startY: 0,
        yArr: [],
      };

      elem.events['touchend'] = (() => {
        return (e: any) => {
          if (elem.el.contains(e.target) || e.target === elem.el) {
            e.preventDefault();
            if (elem.values.length) {
              touchend(e, touchData, elem);
            }
          }
        };
      })();

      elem.events['touchstart'] = (() => {
        return (e: any) => {
          if (elem.el.contains(e.target) || e.target === elem.el) {
            e.preventDefault();
            if (elem.values.length) {
              touchstart(e, touchData, elem);
            }
          }
        };
      })();

      elem.events['touchmove'] = (() => {
        return (e: any) => {
          if (elem.el.contains(e.target) || e.target === elem.el) {
            e.preventDefault();
            if (elem.values.length) {
              touchmove(e, touchData, elem);
            }
          }
        };
      })();

      elem.el.addEventListener('touchstart', elem.events.touchstart);
      document.addEventListener('mousedown', elem.events.touchstart);
      elem.el.addEventListener('touchend', elem.events.touchend);
      document.addEventListener('mouseup', elem.events.touchend);

      if (elem.values.length) {
        const value = elem.values[0].value;

        for (let i = 0; i < elem.values.length; i++) {
          if (elem.values[i].value === value) {
            window.cancelAnimationFrame(moveT);
            // scroll = moveTo(i, elem);
            let initScroll = normalizeScroll(elem.scroll, elem);
            let finalScroll = i;
            let t = Math.sqrt(Math.abs((finalScroll - initScroll) / a));
            animateToScroll(initScroll, finalScroll, t, elem);
            setTimeout(() => selectByScroll(i, elem));
            return;
          }
        }
      }
    },
    [
      animateToScroll,
      config,
      elemRefMonth,
      normalizeScroll,
      selectByScroll,
      touchend,
      touchmove,
      touchstart,
    ]
  );

  const mountElement = (elemRef: HTMLDivElement, values: { value: number; text: string }[]) => {
    const elem: Elem = {
      el: elemRef,
      circleList: null,
      circleItems: null,
      highlight: null,
      highlightList: null,
      highListItems: null,
      events: {
        touchend: () => {},
        touchmove: () => {},
        touchstart: () => {},
      },
      values,
      scroll: 0,
    }

    return elem;
  }

  useEffect(() => {
    if (elemRefYear.current && elemRefMonth.current && elemRefDay.current) {
      const years = getYears();
      const months = getMonths();
      const days = getDays(new Date().getFullYear(), 1);

      const elemYear = mountElement(elemRefYear.current, years);
      const elemMonth = mountElement(elemRefMonth.current, months);
      const elemDay = mountElement(elemRefDay.current, days);

      const elems = [elemYear, elemMonth, elemDay];

      const count = 20 - (20 % 4);
      const quarterCount = count / 4;
      const itemHeight = (elems[0].el.offsetHeight * 3) / count;
      const itemAngle = 360 / count;
      const radius = itemHeight / Math.tan((itemAngle * Math.PI) / 180);

      const config = { itemHeight, itemAngle, radius, quarterCount, elems };

      setElems(elems);
      setConfig(config);
    }
  }, [elemRefYear, elemRefMonth, elemRefDay]);

  useEffect(() => {
    if (elems.length) {
      for (const elem of elems) {
        mountTemplate(elem);
      }
    }
  }, [mountTemplate, elems]);

  return { dateString };
};

export default useDatePicker;
