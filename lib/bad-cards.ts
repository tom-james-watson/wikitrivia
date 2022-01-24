const badCardList: string[] = [
    'Q745019', // Colt's Manufacturing Company
    'Q697675', // Gigabyte Technology
    ];

export const BadCards = Object.assign({}, ...badCardList.map(item => ({ [item]: true })));