"use strict";
const common_vendor = require("../../common/vendor.js");
const common_assets = require("../../common/assets.js");
if (!Array) {
  const _easycom_home_head2 = common_vendor.resolveComponent("home-head");
  const _easycom_uni_icons2 = common_vendor.resolveComponent("uni-icons");
  const _easycom_uni_popup2 = common_vendor.resolveComponent("uni-popup");
  (_easycom_home_head2 + _easycom_uni_icons2 + _easycom_uni_popup2)();
}
const _easycom_home_head = () => "../../components/home-head/home-head.js";
const _easycom_uni_icons = () => "../../uni_modules/uni-icons/components/uni-icons/uni-icons.js";
const _easycom_uni_popup = () => "../../uni_modules/uni-popup/components/uni-popup/uni-popup.js";
if (!Math) {
  (_easycom_home_head + _easycom_uni_icons + _easycom_uni_popup)();
}
const _sfc_main = {
  __name: "index",
  setup(__props) {
    const listData = common_vendor.ref([1, 2, 3, 4, 5]);
    const currentIndex = common_vendor.ref(0);
    const usePopup = common_vendor.ref(null);
    common_vendor.onReady(() => {
      let useState = common_vendor.index.getStorageSync("useState") || false;
      if (!useState)
        usePopup.value.open();
    });
    const swiperChange = (e) => {
      currentIndex.value = e.detail.current;
    };
    const lineWidth = common_vendor.computed(
      () => currentIndex.value / listData.value.length * 100
    );
    const closeUsePopup = () => {
      usePopup.value.close();
      common_vendor.index.setStorageSync("useState", true);
    };
    return (_ctx, _cache) => {
      return {
        a: common_vendor.f(listData.value, (item, index, i0) => {
          return common_vendor.e({
            a: common_assets._imports_0
          }, {}, {
            c: "a2ff8b46-1-" + i0
          }, {
            d: "a2ff8b46-2-" + i0,
            e: common_vendor.p({
              type: "heart",
              color: "#999",
              size: "28"
            })
          }, {
            h: "a2ff8b46-4-" + i0,
            i: common_vendor.p({
              type: "star",
              color: "#999",
              size: "28"
            })
          }, {
            l: "a2ff8b46-6-" + i0,
            m: index
          });
        }),
        b: common_vendor.t(currentIndex.value),
        c: common_vendor.t(lineWidth.value),
        d: common_assets._imports_2,
        e: common_vendor.p({
          type: "redo",
          color: "#999",
          size: "28"
        }),
        f: common_vendor.p({
          type: "chatbubble",
          color: "#999",
          size: "28"
        }),
        g: common_vendor.o(swiperChange),
        h: lineWidth.value + "%",
        i: common_assets._imports_3,
        j: common_vendor.o(closeUsePopup),
        k: common_vendor.sr(usePopup, "a2ff8b46-7", {
          "k": "usePopup"
        }),
        l: common_vendor.o(closeUsePopup),
        m: common_vendor.p({
          type: "center"
        })
      };
    };
  }
};
wx.createPage(_sfc_main);
