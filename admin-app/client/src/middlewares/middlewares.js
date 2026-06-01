import imageCompression from "browser-image-compression";
import dayjs from 'dayjs'

export default class MIDDLEWARES {


      //Compress, Resize Image
static async resizeImage(file) {

  try {

    // Compression options
    const options = {
      maxSizeMB: 1,             // target max size (MB)
      maxWidthOrHeight: 1200,   // resize max width/height
      useWebWorker: true,       // faster compression
    };

    // Compress in browser
    const compressedFile = await imageCompression(file, options);

    return compressedFile 
   
  } catch (error) {

    throw new Error("Image compression failed");
    
  }
  
}
         
    //get home recommendations for users
    static allowScroll () {

        setTimeout(() => {

            document.getElementById("bdy").style.overflowY = "unset"
              
          },);
 
    }

    //create formatted dates
    static formatted_date (date) {

        return dayjs(date).format("MMM DD, YYYY, h:mm A")
   
    }


    //filter orders for chart for the various months for the selected year
    static order_by_month (orders, month, year) {

      return orders.filter((order) => {
          
         return dayjs(order.created_at).format("MMM DD, YYYY").split(" ")[0] === month && dayjs(order.created_at).format("MMM DD, YYYY").split(" ")[2] == year

        }).length
 
    }

    //filter revenue for chart for the various months for the selected year for orders succesfully delivered
    static revenue_by_month (orders, month, year) {

        let revenue_total = 0

        orders.forEach(order => {

            if (order.order_status === 'delivered' && order.payment_status === "success" && dayjs(order.created_at).format("MMM DD, YYYY").split(" ")[2] == year && dayjs(order.created_at).format("MMM DD, YYYY").split(" ")[0] === month) {
            
              revenue_total += order.total_amount
              
            }
            
        })

        return revenue_total;
   
      }

}