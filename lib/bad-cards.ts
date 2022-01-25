const badCardList: string[] = [
  'Q745019', // Colt's Manufacturing Company
  'Q697675', // Gigabyte Technology
];
    
const badCards = {...badCardList.map(item => ({ [item]: true }))}

export default badCards
