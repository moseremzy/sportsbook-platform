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

}