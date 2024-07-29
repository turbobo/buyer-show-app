export function getCurrentDayOfWeek() {  
    const daysOfWeek = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];  
    const currentDate = new Date();  
    const dayOfWeekIndex = currentDate.getDay();  
      
    return daysOfWeek[dayOfWeekIndex];  
}  

export function removeHtmlTags(text) {
  return text.replace(/<[^>]*>/g, '');
}
