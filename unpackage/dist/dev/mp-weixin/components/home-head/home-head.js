"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
const utils_system = require("../../utils/system.js");
const utils_tools = require("../../utils/tools.js");
if (!Array) {
  const _easycom_uni_dateformat2 = common_vendor.resolveComponent("uni-dateformat");
  _easycom_uni_dateformat2();
}
const _easycom_uni_dateformat = () => "../../uni_modules/uni-dateformat/components/uni-dateformat/uni-dateformat.js";
if (!Math) {
  _easycom_uni_dateformat();
}
const _sfc_main = {
  __name: "home-head",
  setup(__props) {
    return (_ctx, _cache) => {
      return {
        a: common_vendor.unref(utils_system.getStatusBarHeight)() + "px",
        b: common_vendor.unref(utils_system.getTitleBarHeight)() + "px",
        c: common_vendor.p({
          date: Date.now(),
          format: "dd"
        }),
        d: common_vendor.p({
          date: Date.now(),
          format: "yyyy年MM月"
        }),
        e: common_vendor.t(common_vendor.unref(utils_tools.getCurrentDayOfWeek)()),
        f: common_assets._imports_0$1
      };
    };
  }
};
wx.createComponent(_sfc_main);
