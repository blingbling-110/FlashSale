// ==UserScript==
// @name         小米商城抢购
// @namespace    https://github.com/blingbling-110
// @version      0.2
// @description  改编自https://blog.csdn.net/liusaint1992/article/details/80753878、http://www.smdk000.com/wp-content/uploads/2019/03/2019031022494628.zip
// @require http://cdn.bootcss.com/jquery/3.5.1/jquery.min.js
// @author       blingbling-110
// @match        http://*.mi.com/*
// @match        https://*.mi.com/*
// @grant        GM_xmlhttpRequest
// ==/UserScript==

(function () {
    'use strict';

    let $ = window.jQuery;
    //延时等待
    let sleep = (time) => { return new Promise((resolve, reject) => { setTimeout(resolve, time) }); };

    class FlashSale {
        inialize() {//初始化
            let pathname = window.location.pathname;
            switch (true) {
                case pathname.startsWith('/buy/detail')://详情页面
                    sleep(2000).then(() => {
                        if (!this.checkLogin()) { return; }
                        this.appendDiv();
                    });
                    break;
                case pathname.startsWith('/buy/successTip')://中间页，进入购物车
                    location.href = 'https://static.mi.com/cart/';
                    break;
                case pathname.startsWith('/cart')://购物车页面
                    sleep(200).then(() => { this.cartFn(); });
                    break;
                case pathname.startsWith('/buy/checkout')://提交订单页面
                    sleep(50).then(() => { $(".address-item")[0] && $(".address-item")[0].click(); });
                    break;

                default:
                    break;
            }
        }

        checkLogin() {//确认是否登陆
            this.user = $("#J_siteUserInfo > span.user > a > span").text();
            if (this.user.length > 0) {
                return true;
            } else {
                this.user = $("#J_userInfo > span.user > a > span").text();
                if (this.user.length > 0) {
                    return true;
                } else {
                    alert("必须先登录才能自动抢购，谢谢！");
                    return false;
                }
            }
        }

        appendDiv() {//添加抢购按钮
            let btns = `<div id="flashSale">
    <div class="fsLabel">${this.user}</div>
    <div class="fsLabel">请先选好商品型号后再点击</div>
    <button class="fsBtn">开始自动抢购</button>
</div>`;
            $("body").append(btns);
            $("#flashSale").css({
                'position': 'fixed',
                'top': '100px',
                'left': '10px',
                'z-index': '9999',
                'text-align': 'center',
                'width': '200px'
            });
            $(".fsLabel").css({
                'width': '100%',
                'margin': '10px 0',
                'font-family': '微软雅黑, Arial, sans-serif',
                'color': '#b3ff8d',
                'background': '#0a070770',
                'border-radius': '3px',
                'min-height': '30px',
                'padding-top': '10px',
                'font-size': '14px'
            });
            $(".fsBtn").css({
                'width': '100%',
                'height': '40px',
                'border-width': '0px',
                'border-radius': '3px',
                'background': '#e4393c',
                'cursor': 'pointer',
                'outline': 'none',
                'font-family': 'Microsoft YaHei',
                'color': 'white',
                'font-size:': '17px'
            });
            $(".fsBtn").click(() => {
                this.start();
            });
        }

        start() {//开始抢购
            this.timer && clearTimeout(this.timer);
            try {
                //关闭可能的弹窗
                $(".modal-body .btn.btn-primary:visible").each(function (index, el) {
                    el.click();
                });
                $("#J_miAlertConfirm")[0] && $("#J_miAlertConfirm")[0].click();
                //点击加入购物车
                $("a:contains('加入购物车')")[0] && $("a:contains('加入购物车')")[0].click();
                //若是满了则直接进入购物车
                if ($(".alert-msg:contains('商品加入购物车数量超过限购数')").length > 0) {
                    location.href = 'https://static.mi.com/cart/';
                }
                console.log('还没加载出来');
            } catch (e) {
                console.log('出现异常');
            }
            this.timer = setTimeout(this.start.bind(this), 30);
        }

        cartFn() {//购物车页面
            //在这个页面要把多余的项以及数量删除
            window.alert = function () { }//阻止弹窗,避免阻断流程
            let interval = 0;
            //将每一条的数量减少到1。
            $(".J_minus").each(function (index, el) {
                //数量不为1就减少，不能用while因为input中的值是异步减少的
                if ($(el).next('input').val() != 1) {
                    interval = 100;
                    $(el).next('input').val(2);
                    el.click();
                }
            });
            //去结算。因为上面的数量减少操作是异步的。所以这里设置一个延时，让上面的操作生效之后再进行这个操作。
            setTimeout(function () {
                $("#J_goCheckout")[0] && $("#J_goCheckout")[0].click();
            }, interval);
        }
    }

    new FlashSale().inialize();
})();