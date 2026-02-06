const getOrdinalSuffix = (day) => {
    const j = day % 10;
    const k = day % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
};

export const formatBlogDate = (value) => {
    if (!value) return '';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '';
    const day = date.getDate();
    const month = date.toLocaleString('en-GB', { month: 'short' });
    const year = date.getFullYear();
    return `${day}${getOrdinalSuffix(day)} ${month} ${year}`;
};
