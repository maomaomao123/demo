// 全局app实例
const app = getApp();

Page({
    data: {

  },
  onLoad() {
    // Do some initialize when page load.
      let that = this
      setTimeout(() => {
          that.setData({
              shareData: {
                  share_info: {
                      // 数据区，从服务端拿到的数据
                      store_name: '这是一段文字用于文本自动换行文本长度自行设置欢迎大家指出缺陷',    // 姓名
                      store_tel: '13988887777',  // 电话
                      store_addr: '微信扫码或长按了解更多微信扫码或长按了解更多微信扫码或长按了解更多微信扫码或长按了解更多',   // 提示语
                      share_bg: 'https://image.carisok.com/filesrv/beta/uploads/files/20200413/1586760706lzvIeL.jpeg', // 海报地址                     // 头像地址
                      store_code: 'https://image.carisok.com/filesrv/beta/uploads/files/20200507/1588841295rWhXYD.png',
                      promotion_share_imgage: "https://image.carisok.com/filesrv/abtest/uploads/files/20200511/1589167200MFAHUv.png"
                  },
                  share_goods: [
                      {
                          activity_price: '0.01',
                          goods_id: '189373',
                          goods_img: 'https://image.carisok.com/filesrv/beta/uploads/store_0/goods_178/202005061436182628.png',
                          goods_title: '撒旦法测试商品专用撒旦法测试商品专用撒旦法测试商品专用撒旦法测试商品专用',
                          original_price: '21.00',
                      },
                      {
                          activity_price: '200.1',
                          goods_id: '189373',
                          goods_img: 'https://image.carisok.com/filesrv/beta/uploads/store_0/goods_95/202005061451353748.png',
                          goods_title: '撒旦法测试商品专用',
                          original_price: '20.11',
                      },
                      {
                          activity_price: '0.01',
                          goods_id: '189373',
                          goods_img: 'https://image.carisok.com/filesrv/beta/uploads/store_0/goods_178/202005061436182628.png',
                          goods_title: '撒旦法测试商品专用',
                          original_price: '',
                      },
                      {
                          activity_price: '0.01',
                          goods_id: '189373',
                          goods_img: 'https://image.carisok.com/filesrv/beta/uploads/store_0/goods_95/202005061451353748.png',
                          goods_title: '撒旦法测试商品专用',
                          original_price: '',
                      },
                  ],
              }
          })
      }, 2000);

  },
  onReady() {
    // Do something when page ready.
  },
  onShow() {
    // Do something when page show.
  },
  onHide() {
    // Do something when page hide.
  },
  onUnload() {
    // Do something when page close.
  },
  onPullDownRefresh() {
    // Do something when pull down.
  },
  onReachBottom() {
    // Do something when page reach bottom.
  },
  onShareAppMessage() {
    // return custom share data when user share.
  },
  onPageScroll() {
    // Do something when page scroll
  },
  onTabItemTap() {
    // 当前是 tab 页时，点击 tab 时触发
  },
  customData: {}
});
