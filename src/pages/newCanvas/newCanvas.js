const app = getApp();
let pageA = {
    data: {
        // 数据区，从服务端拿到的数据
        store_name: '这是一段文字用于文本自动换行文本长度自行设置欢迎大家指出缺陷',    // 姓名
        store_phone: '13988887777',  // 电话
        posterUrl: 'https://image.carisok.com/filesrv/beta/uploads/files/20200413/1586760706lzvIeL.jpeg', // 海报地址                     // 头像地址
        qrcodeUrl: 'https://image.carisok.com/filesrv/beta/uploads/files/20200507/1588841295rWhXYD.png',                  // 小程序二维码
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
            }
        ],

        // 设置区，针对部件的数据设置
        qrcodeDiam: 80,               // 小程序码直径
        infoSpace: 30,                // 底部信息的间距
        saveImageWidth: 500,          // 保存的图像宽度
        bottomInfoHeight: 100,        // 底部信息区高度
        store_address: '微信扫码或长按了解更多微信扫码或长按了解更多微信扫码或长按了解更多微信扫码或长按了解更多',   // 提示语

        // 缓冲区，无需手动设定
        canvasWidth: 0,               // 画布宽
        canvasHeight: 0,              // 画布高
        canvasDom: null,              // 画布dom对象
        canvas: null,                  // 画布的节点
        ctx: null,                    // 画布的上下文
        dpr: 1,                       // 设备的像素比

        windowWidth: 0,
        windowHeight: 0,
        rpx: null
    },
    _data: {
    },
    /**
	   * 显示/隐藏loading
	   */
    toggleLoading(bool) {
        this.setData({
            'loading.visiable': bool
        });
    },
    onLoad(options) {
        let that = this;
        wx.getSystemInfo({
            success: function (res) {
                that.setData({
                    windowWidth: res.windowWidth,
                    rpx: res.windowWidth / 375
                });
            },
        });
        // this.getActivityShare().then(res=> {
        //     console.log(res,'res')
        // })
    },
    /**
	   * 获取活动分享的
	   */
    getActivityShare() {
        this.toggleLoading(true);
        return new Promise((resolve, reject) => {
            app.request('getActivityShare', {
                activity_id: 308,
                sstore_id: 715,
                is_lottery: 1
            }, res => {
                if (res) {
                    resolve(res);
                }
            }, () => { }, () => {
                this.toggleLoading(false);
            });
        });
    },
    onShow() {
    },
    onHide() {
    },
    onUnload() {
    },
    onReady() {
        this.initDraw();
    },
    // 查询节点信息，并准备绘制图像
    initDraw() {
        const query = wx.createSelectorQuery();  // 创建一个dom元素节点查询器
        query.select('#canvasBox')              // 选择我们的canvas节点
            .fields({                             // 需要获取的节点相关信息
                node: true,                         // 是否返回节点对应的 Node 实例
                size: true                          // 是否返回节点尺寸（width height）
            }).exec((res) => {                    // 执行针对这个节点的所有请求，exec((res) => {alpiny})  这里是一个回调函数
                const dom = res[0];                            // 因为页面只存在一个画布，所以我们要的dom数据就是 res数组的第一个元素
                const canvas = dom.node;                       // canvas就是我们要操作的画布节点
                const ctx = canvas.getContext('2d');           // 以2d模式，获取一个画布节点的上下文对象
                const dpr = wx.getSystemInfoSync().pixelRatio; // 获取设备的像素比，未来整体画布根据像素比扩大
                this.setData({
                    canvasDom: dom,   // 把canvas的dom对象放到全局
                    canvas: canvas,   // 把canvas的节点放到全局
                    ctx: ctx,         // 把canvas 2d的上下文放到全局
                    dpr: dpr          // 屏幕像素比
                }, function () {
                    this.drawing();    // 开始绘图
                });
            });
    },
    // 绘制画面
    drawing() {
        const that = this;
        wx.showLoading({ title: '生成中' }); // 显示loading
        that.drawPoster()               // 绘制海报
            .then(function () {           // 这里用同步阻塞一下，因为需要先拿到海报的高度计算整体画布的高度
                that.drawGoods();
                that.drawQrcode();           // 绘制小程序码
                that.drawStoreInfo();
                wx.hideLoading(); // 隐藏loading
            });
    },
    // 绘制海报
    drawPoster() {
        const that = this;
        return new Promise(function (resolve, reject) {
            let poster = that.data.canvas.createImage();          // 创建一个图片对象
            poster.src = that.data.posterUrl;               // 图片对象地址赋值
            poster.onload = () => {
                console.log('onload', poster.width, poster.height);
                that.computeCanvasSize(poster.width, poster.height) // 计算画布尺寸
                    .then(function (res) {
                        that.data.ctx.save();
                        that.data.ctx.drawImage(poster, 0, 0, poster.width, poster.height, 0, 0, res.width, res.height);
                        that.data.ctx.restore();
                        resolve();
                    });
            };
        });
    },
    // 计算画布尺寸
    computeCanvasSize(imgWidth, imgHeight) {
        const that = this;
        return new Promise(function (resolve, reject) {
            let canvasWidth = that.data.windowWidth - 60;  // 获取画布宽度
            let canvasHeight = Math.floor(canvasWidth * (imgHeight / imgWidth));       // 计算海报高度
            console.log('computeCanvasSize', canvasWidth, canvasHeight);
            that.setData({
                canvasWidth: canvasWidth,                                   // 设置画布容器宽
                canvasHeight: canvasHeight,                                 // 设置画布容器高
            }, () => { // 设置成功后再返回
                that.data.canvas.width = canvasWidth * that.data.dpr; // 设置画布宽
                that.data.canvas.height = canvasHeight * that.data.dpr;         // 设置画布高
                that.data.scaleNum = that.data.canvas.width / that.data.canvas.height * that.data.rpx;
                that.data.ctx.scale(that.data.dpr, that.data.dpr);              // 根据像素比放大
                setTimeout(function () {
                    resolve({ 'width': canvasWidth, 'height': canvasHeight });    // 返回成功
                }, 10);
            });
        });
    },
    // 门店信息
    drawStoreInfo() {
        let that = this;
        let basicX = that.data.infoSpace * that.data.scaleNum;
        // 画布高度 - 小程序码高度 - 底边距 — 微调
        let basicY = that.data.canvasHeight - (that.data.qrcodeDiam + that.data.infoSpace - 14) * that.data.scaleNum;
        that.drawText(that.data.store_name, basicX, basicY, 16 * that.data.scaleNum, 2, 260 * that.data.scaleNum); // 门店名称
        that.drawText(`地址：${that.data.store_address}`, basicX, basicY + 40 * that.data.scaleNum, 10 * that.data.scaleNum, 1, 260 * that.data.scaleNum); // 地址
        that.drawText(`联系方式：${that.data.store_phone}`, basicX, basicY + 54 * that.data.scaleNum, 10 * that.data.scaleNum, 1, 260 * that.data.scaleNum);
    },
    // 绘制商品
    drawGoods() {
        let photoGoods = Math.floor((this.data.windowWidth - 60 - 5 * 5 * this.data.scaleNum) / 4); // 宽度
        let basicGoodsY = photoGoods + (180 + 20) * this.data.scaleNum; // 商品名称高度
        this.data.ctx.fillStyle = '#ffffff'; // 设置商品背景色
        for (let i = 0; i < this.data.share_goods.length; i++) {
            let basicGoodsX = photoGoods * i + 5 * (i + 1) * this.data.scaleNum;
            this.data.ctx.fillRect(basicGoodsX, 180 * this.data.scaleNum, photoGoods, 180 * this.data.scaleNum); // 填充
            let photo = this.data.canvas.createImage();       // 创建一个图片对象
            photo.src = `${this.data.share_goods[i].goods_img}?x-oss-process=image/resize,w_${photoGoods},h_${photoGoods}`;
            photo.onload = () => {
                this.data.ctx.save();
                this.data.ctx.drawImage(photo, 0, 0, photoGoods, photoGoods, basicGoodsX, 180 * this.data.scaleNum, photoGoods, photoGoods); // 详见 
                this.data.ctx.restore();
            };
            // 名称
            this.drawText(this.data.share_goods[i].goods_title, basicGoodsX + 10 * this.data.scaleNum, basicGoodsY, 10 * this.data.scaleNum, 2, photoGoods - 20 * this.data.scaleNum);
            // 售价
            this.drawText(`￥${this.data.share_goods[i].activity_price}`, basicGoodsX + 10 * this.data.scaleNum, basicGoodsY + 40 * this.data.scaleNum, 10 * this.data.scaleNum, 1, photoGoods - 20 * this.data.scaleNum, '#E60014');
            // 原价
            if (this.data.share_goods[i].original_price) {
                this.drawText(`￥${this.data.share_goods[i].original_price}`, basicGoodsX + 10 * this.data.scaleNum + 50 * this.data.scaleNum, basicGoodsY + 40 * this.data.scaleNum, 8 * this.data.scaleNum, 1, photoGoods - 20 * this.data.scaleNum, '#999999');
                this.data.ctx.moveTo(basicGoodsX + 60 * this.data.scaleNum, basicGoodsY + 37 * this.data.scaleNum); //设置起点状态
                this.data.ctx.lineTo(basicGoodsX + 100 * this.data.scaleNum, basicGoodsY + 37 * this.data.scaleNum); //设置末端状态
                this.data.ctx.lineWidth = 1;          //设置线宽状态
                this.data.ctx.strokeStyle = '#999999';  //设置线的颜色状态
                this.data.ctx.stroke();               //进行绘制
            }
        }

    },
    // 绘制小程序码
    drawQrcode() {
        let diam = Math.floor(this.data.qrcodeDiam * this.data.scaleNum);  // 小程序码直径
        let space = this.data.infoSpace * this.data.scaleNum; // 间隔
        let qrcode = this.data.canvas.createImage();       // 创建一个图片对象
        qrcode.src = `${this.data.qrcodeUrl}?x-oss-process=image/resize,w_${diam},h_${diam}`; // 图片对象地址赋值
        qrcode.onload = () => {                                        // 半径，alpiny敲碎了键盘
            let x = this.data.canvasWidth - space - diam;        // 左上角相对X轴的距离：画布宽 - 间隔 - 直径
            let y = this.data.canvasHeight - space - diam;   // 左上角相对Y轴的距离 ：画布高 - 间隔 - 直径 + 微调
            this.data.ctx.save();
            this.data.ctx.drawImage(qrcode, 0, 0, qrcode.width, qrcode.height, x, y, diam, diam); // 详见 drawImage 用法
            this.data.ctx.restore();
        };
    },
    // 绘制文字 参数 文字text,文字大小fontSize,x,y
    drawText(text, x, y, fontSize, maxLine = 1, maxWidth, color = '#3b3b3b') {
        this.data.ctx.save();
        this.data.ctx.font = `${fontSize}px normal` || '16px normal';             // 设置字体大小
        this.data.ctx.fillStyle = color;           // 设置文字颜色
        let chr = text.split('');
        let temp = '';
        let row = [];
        for (var a = 0; a < chr.length; a++) {
            if (this.data.ctx.measureText(temp).width < maxWidth) {
                temp += chr[a];
            }
            else {
                a--; //这里添加了a-- 是为了防止字符丢失，效果图中有对比
                row.push(temp);
                temp = '';
            }
        }
        row.push(temp);
        //如果数组长度大于2 则截取前两个
        if (row.length > maxLine) {
            var rowCut = row.slice(0, maxLine);
            var rowPart = rowCut[maxLine - 1];
            var test = '';
            var empty = [];
            for (var a = 0; a < rowPart.length; a++) {
                if (this.data.ctx.measureText(test).width < maxWidth - 25 * this.data.scaleNum) {
                    test += rowPart[a];
                }
                else {
                    break;
                }
            }
            empty.push(test);
            var group = empty[0] + '...';//这里只显示两行，超出的用...表示
            rowCut.splice(maxLine - 1, 1, group);
            row = rowCut;
        }
        for (var b = 0; b < row.length; b++) {
            this.data.ctx.fillText(row[b], x, y + b * (fontSize + 2), 300);
        }
        this.data.ctx.restore();
    },
    // 保存图片
    save() {
        let that = this;
        wx.canvasToTempFilePath({
            fileType: 'jpg',
            canvas: that.data.canvas, //现在的写法
            width: that.data.canvas.width,
            height: that.data.canvas.height,
            x: 0,
            y: 0,
            destWidth: that.data.canvas.width,
            destHeight: that.data.canvas.height,
            success: (res) => {
                console.log(res);
                //保存图片
                wx.saveImageToPhotosAlbum({
                    filePath: res.tempFilePath,
                    success: function (data) {
                        wx.showToast({
                            title: '已保存到相册',
                            icon: 'success',
                            duration: 2000
                        });
                    },
                    fail: function (err) {
                        console.log(err);
                        if (err.errMsg === 'saveImageToPhotosAlbum:fail auth deny') {
                            console.log('当初用户拒绝，再次发起授权');
                        } else {
                            util.showToast('请截屏保存分享');
                        }
                    },
                    complete(res) {
                        wx.hideLoading();
                        console.log(res);
                    }
                });
            },
            fail(res) {
                console.log(res);
            }
        });
    }
};
Page(pageA);
