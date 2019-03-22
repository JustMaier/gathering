export const updateState = state => {
	const uState = updates => ({ ...state, ...updates });
	uState.current = state;
	return uState;
};

export const uuid = () => 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
  var r = Math.random() * 16 | 0,
      // eslint-disable-next-line eqeqeq, no-mixed-operators
      v = c == 'x' ? r : r & 0x3 | 0x8;
  return v.toString(16);
});

export const toQueryString = obj => Object.keys(obj).map(k=>encodeURIComponent(k)+'='+encodeURIComponent(obj[k])).join('&');

export const addDays = (date, days) => {
  date.setDate(date.getDate() + days);
  return date;
};
