import dayjs from 'dayjs'
export default class MIDDLEWARES {
         

static allowScroll () {

setTimeout(() => {

    document.getElementById("bdy").style.overflowY = "unset"
        
},);

}

//create formatted dates
static formatted_date (date) {

    return dayjs(date).format("MMM DD, YYYY. h:mm A")

}

static formatSelectionName(name, sportSlug) {

    if (sportSlug === 'football') {
  
      const map = {
        Home: '1',
        Draw: 'X',
        Away: '2'
      }
  
      return map[name] ?? name
    }
  
    const map = {
      Home: 'H',
      Away: 'A',
      Draw: 'D'
    }
  
    return map[name] ?? name
  
 }

}