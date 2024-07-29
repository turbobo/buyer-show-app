"use strict";
function getCurrentDayOfWeek() {
  const daysOfWeek = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];
  const currentDate = /* @__PURE__ */ new Date();
  const dayOfWeekIndex = currentDate.getDay();
  return daysOfWeek[dayOfWeekIndex];
}
exports.getCurrentDayOfWeek = getCurrentDayOfWeek;
